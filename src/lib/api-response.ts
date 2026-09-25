export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function jsonResponse<T>(data: T, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

export function errorResponse(error: string, status = 400): Response {
  return jsonResponse({ success: false, error }, status);
}

export function successResponse<T>(data: T): Response {
  return jsonResponse({ success: true, data });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "127.0.0.1";
}
