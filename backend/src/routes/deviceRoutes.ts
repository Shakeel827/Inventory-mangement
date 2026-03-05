import { Router } from "express";
import multer from "multer";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import {
  checkOutDevice,
  checkInDevice,
  bulkUploadDevices
} from "../controllers/deviceController";

const upload = multer(); // in-memory storage

export const deviceRouter = Router();

deviceRouter.use(authMiddleware);

deviceRouter.post(
  "/:deviceId/check-out",
  requireRole(["employee", "manager", "company_admin"]),
  checkOutDevice
);

deviceRouter.post(
  "/:deviceId/check-in",
  requireRole(["employee", "manager", "company_admin"]),
  checkInDevice
);

deviceRouter.post(
  "/bulk-upload",
  requireRole(["manager", "company_admin"]),
  upload.single("file"),
  bulkUploadDevices
);

