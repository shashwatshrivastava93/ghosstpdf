import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export function createTestPdf(size1k: number = 10): Buffer {
  const header = Buffer.from("%PDF-1.4\n");
  const body = crypto.randomBytes(size1k * 1024);
  const trailer = Buffer.from("\n%%EOF\n");
  return Buffer.concat([header, body, trailer]);
}

export function createTestObjectKey(id: string): string {
  return `ghostpdf/test/${id}/test.enc`;
}

export function createTestDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ghostpdf-test-"));
}

export function cleanupTestDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

export function createTestEnv() {
  return {
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/ghostpdf_test",
    R2_ACCOUNT_ID: "test-account",
    R2_ACCESS_KEY_ID: "test-access-key",
    R2_SECRET_ACCESS_KEY: "test-secret-key",
    R2_BUCKET_NAME: "ghostpdf-test",
    INTERNAL_API_KEY: "test-api-key",
  };
}