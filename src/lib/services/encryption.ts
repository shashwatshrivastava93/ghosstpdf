import crypto from "crypto";

export const encryptionService = {
  generateObjectKey(id: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString("hex");
    return `ghostpdf/${id}/${timestamp}-${random}.enc`;
  },

  /**
   * Validates that the key is 32 bytes (AES-256)
   * and IV is 12 bytes (for GCM).
   * These values are generated client-side and sent with the upload.
   */
  validateEncryptionParams(wrappedKey: Buffer, iv: Buffer): boolean {
    return wrappedKey.length === 32 && iv.length === 12;
  },

  /**
   * Generates a random UUID for file identification
   */
  generateId(): string {
    return crypto.randomUUID();
  },
};
