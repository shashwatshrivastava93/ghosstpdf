import { MAX_FILE_SIZE, ALLOWED_MIME_TYPE } from "@/lib/constants";

export const fileValidator = {
  isWithinLimit(size: number): boolean {
    return size <= MAX_FILE_SIZE;
  },

  isNonEmpty(size: number): boolean {
    return size > 0;
  },

  isPdfMimeType(mimeType: string): boolean {
    return mimeType === ALLOWED_MIME_TYPE;
  },

  isValidPdf(magicBytes: string): boolean {
    return magicBytes.startsWith("%PDF-");
  },
};