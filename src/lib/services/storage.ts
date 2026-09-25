import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const STORAGE_BACKEND = (process.env.STORAGE_BACKEND ||
  (process.env.NODE_ENV === "development" ? "local" : "r2")) as
  | "r2"
  | "local";

const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".local-storage");

const hasR2Credentials =
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_ACCOUNT_ID !== "your-cloudflare-account-id";

const r2Client = hasR2Credentials
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "ghostpdf";

const localPath = (key: string) => path.join(LOCAL_STORAGE_DIR, key);

const PRESIGN_URL_EXPIRES_SECONDS = 300; // 5 minutes

export const storageService = {
  get backend(): string {
    if (STORAGE_BACKEND === "r2" && !r2Client) return "r2-unconfigured";
    return STORAGE_BACKEND;
  },

  isR2Configured(): boolean {
    return !!r2Client;
  },

  async presignUpload(key: string): Promise<string> {
    if (!r2Client) {
      throw new Error("R2 is not configured for presigned uploads");
    }
    return getSignedUrl(
      r2Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: "application/octet-stream",
        CacheControl: "no-store, no-cache, must-revalidate",
      }),
      { expiresIn: PRESIGN_URL_EXPIRES_SECONDS }
    );
  },

  async presignDownload(key: string): Promise<string> {
    if (!r2Client) {
      throw new Error("R2 is not configured for presigned downloads");
    }
    return getSignedUrl(
      r2Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: PRESIGN_URL_EXPIRES_SECONDS }
    );
  },

  async uploadEncrypted(key: string, data: Buffer): Promise<void> {
    if (r2Client) {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: data,
          ContentType: "application/octet-stream",
          CacheControl: "no-store, no-cache, must-revalidate",
        })
      );
      return;
    }

    const filePath = localPath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
  },

  async downloadEncrypted(key: string): Promise<Buffer | null> {
    if (r2Client) {
      try {
        const response = await r2Client.send(
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          })
        );

        if (!response.Body) return null;

        const chunks: Uint8Array[] = [];
        const reader = response.Body.transformToWebStream().getReader();

        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) {
            chunks.push(result.value);
          }
        }

        return Buffer.concat(chunks);
      } catch {
        return null;
      }
    }

    try {
      return await fs.readFile(localPath(key));
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    if (r2Client) {
      try {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          })
        );
      } catch {
        // Silently fail - file may already be deleted
      }
      return;
    }

    try {
      await fs.rm(localPath(key), { force: true });
    } catch {
      // Silently fail - file may already be deleted
    }
  },
};