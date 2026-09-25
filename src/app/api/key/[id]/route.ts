import { NextRequest } from "next/server";
import { tempFileRepository } from "@/lib/repositories/temp-file";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { errorResponse, successResponse } from "@/lib/api-response";

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

    const wrappedKeyHex = Buffer.from(file.wrappedKey).toString("hex");
    const ivHex = Buffer.from(file.iv).toString("hex");

    await fileLogRepository.create(id, "OPENED", "decryption key issued");

    return successResponse({
      wrappedKey: wrappedKeyHex,
      iv: ivHex,
    });
  } catch (error) {
    console.error("Key retrieval error:", error);
    return errorResponse("Internal server error.", 500);
  }
}