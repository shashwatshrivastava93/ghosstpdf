export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_MIME_TYPE = "application/pdf";
export const FILE_EXPIRY_MINUTES = 10;
export const ALLOWED_EXPIRY_MINUTES = [2, 5, 10, 30, 60] as const;
export const DEFAULT_EXPIRY_MINUTES = 10;
export const UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const UPLOAD_RATE_LIMIT_MAX = 10; // max 10 uploads per minute per IP
export const AES_KEY_LENGTH = 256;
export const AES_IV_LENGTH = 12; // 96 bits for GCM
export const API_KEY = process.env.INTERNAL_API_KEY || "ghostpdf-internal-key-change-in-production";

export function isAllowedExpiryMinutes(value: number): boolean {
  return (ALLOWED_EXPIRY_MINUTES as readonly number[]).includes(value);
}
