import { FILE_UPLOAD, ERROR_MESSAGES } from '../constants';

/**
 * File Validation Utilities
 * Validates file uploads for size, type, and content
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }
  return { valid: true };
}

/**
 * Validate file type by extension
 */
export function validateFileExtension(file: File): FileValidationResult {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = FILE_UPLOAD.ALLOWED_EXCEL_EXTENSIONS.some(
    ext => fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }
  return { valid: true };
}

/**
 * Validate file MIME type
 */
export function validateFileMimeType(file: File): FileValidationResult {
  if (!FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }
  return { valid: true };
}

/**
 * Comprehensive file validation
 * Checks size, extension, and MIME type
 */
export function validateExcelFile(file: File): FileValidationResult {
  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Check file extension
  const extensionValidation = validateFileExtension(file);
  if (!extensionValidation.valid) {
    return extensionValidation;
  }

  // Check MIME type (if available)
  if (file.type) {
    const mimeValidation = validateFileMimeType(file);
    if (!mimeValidation.valid) {
      return mimeValidation;
    }
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
