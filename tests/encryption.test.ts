import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { encryptionService } from "@/lib/services/encryption";

describe("encryptionService", () => {
  it("generates unique object keys", () => {
    const key1 = encryptionService.generateObjectKey("test-id");
    const key2 = encryptionService.generateObjectKey("test-id");

    expect(key1).not.toBe(key2);
    expect(key1).toContain("ghostpdf/test-id/");
    expect(key1).toMatch(/\.enc$/);
  });

  it("validates correct encryption params (32-byte key + 12-byte IV)", () => {
    const wrappedKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    expect(encryptionService.validateEncryptionParams(wrappedKey, iv)).toBe(true);
  });

  it("rejects wrong key length", () => {
    const wrappedKey = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    expect(encryptionService.validateEncryptionParams(wrappedKey, iv)).toBe(false);
  });

  it("rejects wrong IV length", () => {
    const wrappedKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    expect(encryptionService.validateEncryptionParams(wrappedKey, iv)).toBe(false);
  });

  it("generates valid UUIDs", () => {
    const id = encryptionService.generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});