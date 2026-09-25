import { describe, expect, it } from "vitest";
import { fileValidator } from "@/lib/services/validator";
import { encryptionService } from "@/lib/services/encryption";
import { isAllowedExpiryMinutes } from "@/lib/constants";
import crypto from "crypto";

describe("upload validation", () => {
  it("server validates encrypted payload structure", () => {
    const wrappedKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    expect(encryptionService.validateEncryptionParams(wrappedKey, iv)).toBe(
      true
    );
  });

  it("server rejects wrong wrapped key length", () => {
    const wrappedKey = crypto.randomBytes(16); // too short
    const iv = crypto.randomBytes(12);

    expect(encryptionService.validateEncryptionParams(wrappedKey, iv)).toBe(
      false
    );
  });

  it("server rejects wrong IV length", () => {
    const wrappedKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16); // too long

    expect(encryptionService.validateEncryptionParams(wrappedKey, iv)).toBe(
      false
    );
  });

  it("server rejects empty encrypted files", () => {
    expect(fileValidator.isWithinLimit(0)).toBe(true);
    expect(fileValidator.isNonEmpty(0)).toBe(false);
  });

  it("server enforces max file size", () => {
    expect(fileValidator.isWithinLimit(10 * 1024 * 1024)).toBe(true);
    expect(fileValidator.isWithinLimit(10 * 1024 * 1024 + 1)).toBe(false);
  });

  it("client validates PDF magic bytes before encryption", () => {
    expect(fileValidator.isValidPdf("%PDF-1.7")).toBe(true);
    expect(fileValidator.isValidPdf("%PDF-  invalid"))
    .toBe(true);
    expect(fileValidator.isValidPdf("PK\x03\x04")).toBe(false);
    expect(fileValidator.isValidPdf("<html>")).toBe(false);
    expect(fileValidator.isValidPdf("")).toBe(false);
    expect(fileValidator.isValidPdf("%PNG")).toBe(false);
  });

  it("server accepts only allowed expiry durations", () => {
    expect(isAllowedExpiryMinutes(2)).toBe(true);
    expect(isAllowedExpiryMinutes(10)).toBe(true);
    expect(isAllowedExpiryMinutes(60)).toBe(true);
    expect(isAllowedExpiryMinutes(3)).toBe(false);
    expect(isAllowedExpiryMinutes(0)).toBe(false);
    expect(isAllowedExpiryMinutes(-5)).toBe(false);
    expect(isAllowedExpiryMinutes(Number.NaN)).toBe(false);
  });
});