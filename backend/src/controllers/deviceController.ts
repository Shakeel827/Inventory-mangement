import { Request, Response } from "express";
import admin from "../config/firebaseAdmin";
import { firestore } from "../config/firebaseAdmin";
import XLSX from "xlsx";

/**
 * Firestore collection handles.
 * All of these collections are multi‑tenant, scoped by the `orgId` field.
 */
const devicesCol = firestore.collection("devices");
const activitiesCol = firestore.collection("deviceActivity");
const categoriesCol = firestore.collection("categories");
const locationsCol = firestore.collection("locations");
const departmentsCol = firestore.collection("departments");

/**
 * POST /devices/:deviceId/check-out
 *
 * Business rules:
 * - User must belong to the same org as the device.
 * - Device must currently be in `available` status.
 * - We atomically:
 *   1) Update the device document (status, assignee, timestamps).
 *   2) Append a row to the device activity history.
 */
export async function checkOutDevice(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { expectedReturnAt, location, notes } = req.body;
    const user = req.user!;

    const deviceRef = devicesCol.doc(deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists || deviceSnap.data()!.orgId !== user.orgId) {
      return res.status(404).json({ error: "Device not found" });
    }

    const device = deviceSnap.data()!;
    if (device.status !== "available") {
      return res
        .status(400)
        .json({ error: `Device is not available (status: ${device.status})` });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const activityRef = activitiesCol.doc();

    await firestore.runTransaction(async (tx) => {
      tx.update(deviceRef, {
        status: "checked_out",
        currentAssigneeUserId: user.uid,
        lastCheckOutAt: now,
        expectedReturnAt: expectedReturnAt ? new Date(expectedReturnAt) : null,
        updatedAt: now
      });

      tx.set(activityRef, {
        orgId: user.orgId,
        deviceId,
        userId: user.uid,
        action: "check_out",
        timestamp: now,
        location: location || null,
        notes: notes || null
      });
    });

    const updatedDeviceSnap = await deviceRef.get();
    const updatedDevice = { id: updatedDeviceSnap.id, ...updatedDeviceSnap.data() };

    return res.status(200).json({
      device: updatedDevice,
      activity: {
        id: activityRef.id,
        action: "check_out",
        timestamp: new Date().toISOString(),
        location: location || null,
        userId: user.uid
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("checkOutDevice error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /devices/:deviceId/check-in
 *
 * Business rules:
 * - User must belong to the same org as the device.
 * - Device must currently be in `checked_out` status.
 * - We atomically:
 *   1) Mark the device back as `available`.
 *   2) Append a `check_in` row to the device activity history.
 */
export async function checkInDevice(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { location, notes } = req.body;
    const user = req.user!;

    const deviceRef = devicesCol.doc(deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists || deviceSnap.data()!.orgId !== user.orgId) {
      return res.status(404).json({ error: "Device not found" });
    }

    const device = deviceSnap.data()!;
    if (device.status !== "checked_out") {
      return res
        .status(400)
        .json({ error: `Device is not checked out (status: ${device.status})` });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const activityRef = activitiesCol.doc();

    await firestore.runTransaction(async (tx) => {
      tx.update(deviceRef, {
        status: "available",
        currentAssigneeUserId: null,
        expectedReturnAt: null,
        updatedAt: now
      });

      tx.set(activityRef, {
        orgId: user.orgId,
        deviceId,
        userId: user.uid,
        action: "check_in",
        timestamp: now,
        location: location || null,
        notes: notes || null
      });
    });

    const updatedDeviceSnap = await deviceRef.get();
    const updatedDevice = { id: updatedDeviceSnap.id, ...updatedDeviceSnap.data() };

    return res.status(200).json({
      device: updatedDevice,
      activity: {
        id: activityRef.id,
        action: "check_in",
        timestamp: new Date().toISOString(),
        location: location || null,
        userId: user.uid
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("checkInDevice error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Utility to resolve a human‑readable name (e.g. category, location)
 * into the corresponding document id for the current org.
 */
async function resolveByName(
  collectionRef: FirebaseFirestore.CollectionReference,
  orgId: string,
  name: string
): Promise<string | null> {
  const snap = await collectionRef
    .where("orgId", "==", orgId)
    .where("name", "==", name)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].id;
}

/**
 * POST /devices/bulk-upload
 *
 * Accepts an Excel file (XLSX) and imports many devices in one go.
 *
 * Design goals:
 * - Be forgiving on input (treat missing optional fields as null).
 * - Validate each row independently and report per‑row errors instead of
 *   failing the whole import.
 * - Support `dryRun` mode so admins can preview what will happen.
 */
export async function bulkUploadDevices(req: Request, res: Response) {
  try {
    const user = req.user!;
    const file = (req as any).file as Express.Multer.File | undefined;
    const dryRun = (req.body.dryRun || "false").toString() === "true";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const errors: { row: number; message: string }[] = [];
    const batch = firestore.batch();

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i += 1) {
      const rowNumber = i + 2;
      const row = rows[i];

      const name = String(row["Name"] || "").trim();
      const assetTag = String(row["Asset Tag"] || "").trim();
      const serialNumber = String(row["Serial Number"] || "").trim();
      const categoryName = String(row["Category"] || "").trim();
      const locationName = String(row["Location"] || "").trim();
      const departmentName = String(row["Department"] || "").trim();
      const statusRaw = String(row["Status"] || "").trim().toLowerCase();

      if (!name) {
        errors.push({ row: rowNumber, message: "Missing required field 'Name'" });
        skipped += 1;
        continue;
      }

      let status = "available";
      if (statusRaw) {
        const allowedStatuses = [
          "available",
          "checked_out",
          "under_repair",
          "maintenance_required",
          "retired"
        ];
        if (!allowedStatuses.includes(statusRaw)) {
          errors.push({ row: rowNumber, message: `Invalid status '${statusRaw}'` });
          skipped += 1;
          continue;
        }
        status = statusRaw;
      }

      const [categoryId, locationId, departmentId] = await Promise.all([
        categoryName
          ? resolveByName(categoriesCol, user.orgId, categoryName)
          : Promise.resolve(null),
        locationName
          ? resolveByName(locationsCol, user.orgId, locationName)
          : Promise.resolve(null),
        departmentName
          ? resolveByName(departmentsCol, user.orgId, departmentName)
          : Promise.resolve(null)
      ]);

      if (categoryName && !categoryId) {
        errors.push({ row: rowNumber, message: `Category '${categoryName}' not found` });
        skipped += 1;
        continue;
      }

      if (locationName && !locationId) {
        errors.push({ row: rowNumber, message: `Location '${locationName}' not found` });
        skipped += 1;
        continue;
      }

      if (departmentName && !departmentId) {
        errors.push({
          row: rowNumber,
          message: `Department '${departmentName}' not found`
        });
        skipped += 1;
        continue;
      }

      if (dryRun) {
        created += 1;
      } else {
        const deviceRef = devicesCol.doc();
        batch.set(deviceRef, {
          orgId: user.orgId,
          name,
          assetTag: assetTag || null,
          serialNumber: serialNumber || null,
          categoryId: categoryId || null,
          locationId: locationId || null,
          departmentId: departmentId || null,
          status,
          imageUrl: null,
          qrCodeUrl: null,
          currentAssigneeUserId: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        created += 1;
      }
    }

    if (!dryRun) {
      await batch.commit();
    }

    return res.status(200).json({
      summary: {
        totalRows: rows.length,
        created,
        updated: 0,
        skipped
      },
      errors,
      dryRun
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("bulkUploadDevices error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

