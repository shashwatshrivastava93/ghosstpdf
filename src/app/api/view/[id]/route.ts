import { NextRequest } from "next/server";
import { tempFileRepository } from "@/lib/repositories/temp-file";
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

    const file = await tempFileRepository.findById(id);

    if (!file) {
      return errorResponse("Document not found.", 404);
    }

    if (file.status !== "ACTIVE") {
      return errorResponse(
        "This document has already been opened or expired.",
        410
      );
    }

    if (file.expiresAt < new Date()) {
      return errorResponse("This document has expired.", 410);
    }

    return successResponse({
      id: file.id,
      status: file.status,
      expiresAt: file.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("View check error:", error);
    return errorResponse("Internal server error.", 500);
  }
}
