export type UserRole = "admin" | "manager" | "user";

export type DeviceStatus =
  | "available"
  | "checked_out"
  | "under_repair"
  | "maintenance_required"
  | "retired";

export interface AppUserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  orgId: string;
  role: UserRole;
}

export interface Device {
  id: string;
  orgId: string;
  name: string;
  categoryId?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  location?: string | null;
  status: DeviceStatus;
  imageUrl?: string | null;
  createdAt?: Date | null;
}

export interface Category {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
}

