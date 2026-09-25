import { NextRequest } from "next/server";
import { tempFileRepository } from "@/lib/repositories/temp-file";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { storageService } from "@/lib/services/storage";
import { encryptionService } from "@/lib/services/encryption";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, successResponse, getClientIp } from "@/lib/api-response";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  DEFAULT_EXPIRY_MINUTES,
  isAllowedExpiryMinutes,
} from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return errorResponse("Rate limit exceeded. Try again later.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse("Invalid request body. Expected JSON.");
    }

    const wrappedKeyHex: string | undefined = body.wrappedKey;
    const ivHex: string | undefined = body.iv;
    const size: number | undefined = body.size;
    const expiryRaw: number | undefined = body.expiryMinutes;

    if (!wrappedKeyHex || !ivHex || typeof size !== "number") {
      return errorResponse("Missing required fields: wrappedKey, iv, size");
    }

    if (size <= 0) {
      return errorResponse("File is empty.");
    }

    if (size > MAX_FILE_SIZE) {
      return errorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
    }

    let expiryMinutes = DEFAULT_EXPIRY_MINUTES;
    if (expiryRaw !== undefined) {
      if (!Number.isInteger(expiryRaw) || !isAllowedExpiryMinutes(expiryRaw)) {
        return errorResponse("Invalid expiry duration.");
      }
      expiryMinutes = expiryRaw;
    }

    const wrappedKey = Buffer.from(wrappedKeyHex, "hex");
    const iv = Buffer.from(ivHex, "hex");

    if (!encryptionService.validateEncryptionParams(wrappedKey, iv)) {
      return errorResponse("Invalid encryption parameters.");
    }

    const id = encryptionService.generateId();
    const objectKey = encryptionService.generateObjectKey(id);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await tempFileRepository.create({
      id,
      objectKey,
      wrappedKey,
      iv,
      expiresAt,
    });

    await fileLogRepository.create(
      id,
      "UPLOADED",
      `${size} bytes, expires in ${expiryMinutes} min`
    );

    const uploadUrl = storageService.isR2Configured()
      ? await storageService.presignUpload(objectKey)
      : `/api/uploads/${id}/blob`;

    return successResponse({
      id,
      expiresAt: expiresAt.toISOString(),
      uploadUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Internal server error. Please try again.", 500);
  }
}