import { describe, expect, it } from "vitest";
import { sanitizeFilename, formatBytes } from "@/lib/utils";

describe("API validation utilities", () => {
  it("sanitizes filenames by removing special characters", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("etc_passwd");
    expect(sanitizeFilename("report.pdf")).toBe("report.pdf");
    expect(sanitizeFilename("my file(2).pdf")).toBe("my_file_2_.pdf");
  });

  it("removes path traversal attempts", () => {
    expect(sanitizeFilename("..\\..\\secret.txt")).not.toContain("..");
  });

  it("truncates overly long filenames", () => {
    const longName = "x".repeat(500) + ".pdf";
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
  });
});