import { NextRequest } from "next/server";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { errorResponse, successResponse } from "@/lib/api-response";
import { API_KEY } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${API_KEY}`) {
      return errorResponse("Unauthorized.", 401);
    }

    const fileId = request.nextUrl.searchParams.get("fileId") || undefined;
    const logs = await fileLogRepository.list(fileId);

    return successResponse({
      logs: logs.map((log) => ({
        id: log.id,
        fileId: log.fileId,
        event: log.event,
        detail: log.detail,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Logs retrieval error:", error);
    return errorResponse("Internal server error.", 500);
  }
}