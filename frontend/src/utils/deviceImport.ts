import * as XLSX from "xlsx";
import { writeBatch, collection, doc, Firestore } from "firebase/firestore";
import type { DeviceStatus } from "../types";

export interface ParsedDeviceRow {
  name: string;
  internalCode?: string;
  serialNumber?: string;
  imei?: string;
  location?: string;
  status: DeviceStatus;
  categoryName?: string; // optional column, map to existing category by name
}

export interface ImportResultSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

/**
 * Parse an Excel file buffer into device rows.
 *
 * Expected columns (case-insensitive):
 * - Name
 * - Internal Code (optional)
 * - Serial Number (optional)
 * - IMEI (optional)
 * - Location (optional)
 * - Status (optional, defaults to "available")
 */
export function parseDevicesFromWorkbook(buffer: ArrayBuffer): ParsedDeviceRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const parsed: ParsedDeviceRow[] = [];

  for (const row of rows) {
    const name = String(row["Name"] || row["name"] || "").trim();
    if (!name) {
      // Skip here, validation happens in importDevices
      parsed.push({
        name: "",
        status: "available"
      });
      continue;
    }

    const statusRaw = String(row["Status"] || row["status"] || "").trim().toLowerCase();
    let status: DeviceStatus = "available";
    if (statusRaw) {
      const allowed: DeviceStatus[] = [
        "available",
        "checked_out",
        "under_repair",
        "maintenance_required",
        "retired"
      ];
      if (allowed.includes(statusRaw as DeviceStatus)) {
        status = statusRaw as DeviceStatus;
      }
    }

    parsed.push({
      name,
      internalCode: String(row["Internal Code"] || row["internalCode"] || "").trim() || undefined,
      serialNumber: String(row["Serial Number"] || row["serialNumber"] || "").trim() || undefined,
      imei: String(row["IMEI"] || row["imei"] || "").trim() || undefined,
      location: String(row["Location"] || row["location"] || "").trim() || undefined,
      status,
      categoryName: String(row["Category"] || row["category"] || "").trim() || undefined
    });
  }

  return parsed;
}

/**
 * Import parsed device rows into Firestore in batches with progress callback.
 */
export async function importDevicesToFirestore(
  db: Firestore,
  orgId: string,
  rows: ParsedDeviceRow[],
  categoryMap: Record<string, string> = {},
  customFields: any[] = [],
  onProgress?: (progress: number) => void
): Promise<ImportResultSummary> {
  const errors: { row: number; message: string }[] = [];
  let imported = 0;
  let skipped = 0;

  const devicesCol = collection(db, "devices");
  const BATCH_SIZE = 450;
  let batch = writeBatch(db);
  let batchCount = 0;

  const flushBatch = async () => {
    if (batchCount === 0) return;
    await batch.commit();
    batch = writeBatch(db);
    batchCount = 0;
  };

  for (let i = 0; i < rows.length; i += 1) {
    const rowNumber = i + 2;
    const row = rows[i];

    // Report progress
    if (onProgress) {
      const progress = Math.round(((i + 1) / rows.length) * 100);
      onProgress(progress);
    }

    if (!row.name) {
      errors.push({ row: rowNumber, message: "Missing required field 'Name'" });
      skipped += 1;
      continue;
    }

    const deviceRef = doc(devicesCol);
    
    const deviceData: any = {
      orgId,
      name: row.name,
      categoryId:
        row.categoryName &&
        categoryMap[row.categoryName.toLowerCase()]
          ? categoryMap[row.categoryName.toLowerCase()]
          : null,
      internalCode: row.internalCode || deviceRef.id,
      serialNumber: row.serialNumber || null,
      imei: row.imei || null,
      location: row.location || null,
      status: row.status,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add custom fields
    customFields.forEach(field => {
      const value = (row as any)[field.label] || (row as any)[field.id];
      if (value !== undefined && value !== "") {
        deviceData[field.id] = value;
      }
    });

    batch.set(deviceRef, deviceData);
    batchCount += 1;
    imported += 1;

    if (batchCount >= BATCH_SIZE) {
      await flushBatch();
    }
  }

  await flushBatch();
  
  // Final progress
  if (onProgress) {
    onProgress(100);
  }

  return {
    totalRows: rows.length,
    imported,
    skipped,
    errors
  };
}

