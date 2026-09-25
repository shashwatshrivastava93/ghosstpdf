import { NextRequest } from "next/server";
import { cleanupService } from "@/lib/services/cleanup";
import { errorResponse, successResponse } from "@/lib/api-response";
import { API_KEY } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${API_KEY}`) {
      return errorResponse("Unauthorized.", 401);
    }

    const result = await cleanupService.runFullCleanup();

    return successResponse({
      deleted: result.deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return errorResponse("Internal server error.", 500);
  }
}
