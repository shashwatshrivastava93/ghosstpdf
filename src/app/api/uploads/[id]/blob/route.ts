import { NextRequest } from "next/server";
import { tempFileRepository } from "@/lib/repositories/temp-file";
import { storageService } from "@/lib/services/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, successResponse, getClientIp } from "@/lib/api-response";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "@/lib/constants";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return errorResponse("Invalid file ID.", 400);
    }

    if (storageService.isR2Configured()) {
      return errorResponse("Blob upload through the app is disabled when R2 is configured.", 400);
    }

    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return errorResponse("Rate limit exceeded. Try again later.", 429);
    }

    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_FILE_SIZE) {
      return errorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
    }

    const file = await tempFileRepository.findById(id);
    if (!file) {
      return errorResponse("Upload session not found.", 404);
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    await storageService.uploadEncrypted(file.objectKey, buffer);

    return successResponse({ id });
  } catch (error) {
    console.error("Blob upload error:", error);
    return errorResponse("Internal server error. Please try again.", 500);
  }
}