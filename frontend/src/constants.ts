/**
 * Application Constants
 * Centralized constants for consistent usage across the app
 */

// Device Status Constants
export const DEVICE_STATUS = {
  AVAILABLE: 'available',
  CHECKED_OUT: 'checked_out',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired'
} as const;

export type DeviceStatus = typeof DEVICE_STATUS[keyof typeof DEVICE_STATUS];

// User Role Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXCEL_EXTENSIONS: ['.xlsx', '.xls'],
  ALLOWED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
} as const;

// Query Batch Constants
export const FIRESTORE = {
  BATCH_SIZE: 450,
  MAX_QUERY_LIMIT: 500
} as const;

// UI Constants
export const UI = {
  MIN_TOUCH_TARGET_SIZE: 44, // pixels
  DEBOUNCE_DELAY: 300, // milliseconds
  TOAST_DURATION: 3000 // milliseconds
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_DEVICE_NAME_LENGTH: 2,
  MAX_DEVICE_NAME_LENGTH: 100,
  MAX_CATEGORY_NAME_LENGTH: 50,
  MAX_CUSTOM_FIELD_NAME_LENGTH: 50
} as const;

// Status Display Labels
export const STATUS_LABELS: Record<DeviceStatus, string> = {
  [DEVICE_STATUS.AVAILABLE]: 'Available',
  [DEVICE_STATUS.CHECKED_OUT]: 'Checked Out',
  [DEVICE_STATUS.MAINTENANCE]: 'Maintenance',
  [DEVICE_STATUS.RETIRED]: 'Retired'
};

// Status Colors (Tailwind classes)
export const STATUS_COLORS: Record<DeviceStatus, string> = {
  [DEVICE_STATUS.AVAILABLE]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  [DEVICE_STATUS.CHECKED_OUT]: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  [DEVICE_STATUS.MAINTENANCE]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [DEVICE_STATUS.RETIRED]: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
};

// Role Display Labels
export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.USER]: 'Scanner'
};

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB limit`,
  INVALID_FILE_TYPE: 'Only Excel files (.xlsx, .xls) are allowed',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  GENERIC_ERROR: 'An error occurred. Please try again.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DEVICE_CREATED: 'Device created successfully',
  DEVICE_UPDATED: 'Device updated successfully',
  DEVICE_DELETED: 'Device deleted successfully',
  CATEGORY_CREATED: 'Category created successfully',
  USER_CREATED: 'User created successfully',
  IMPORT_COMPLETE: 'Import completed successfully'
} as const;
