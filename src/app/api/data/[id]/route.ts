import { NextRequest } from "next/server";
import { tempFileRepository } from "@/lib/repositories/temp-file";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { storageService } from "@/lib/services/storage";
import { errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return errorResponse("Invalid file ID.", 400);
    }

const file = await tempFileRepository.findAvailable(id);

    if (!file) {
      return errorResponse(
        "This document has expired.",
        410
      );
    }

    if (storageService.isR2Configured()) {
      const presignedUrl = await storageService.presignDownload(file.objectKey);
      await fileLogRepository.create(id, "DOWNLOADED", "redirected to presigned R2 URL");
      return new Response(null, {
        status: 307,
        headers: {
          Location: presignedUrl,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    const encryptedData = await storageService.downloadEncrypted(file.objectKey);

    if (!encryptedData) {
      return errorResponse("Document data not found.", 404);
    }

    await fileLogRepository.create(id, "DOWNLOADED", `${encryptedData.length} bytes served`);

    return new Response(new Uint8Array(encryptedData), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Data retrieval error:", error);
    return errorResponse("Internal server error.", 500);
  }
}