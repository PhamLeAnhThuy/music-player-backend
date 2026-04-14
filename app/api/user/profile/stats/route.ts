import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { getUserListeningStats } from "@/services/userService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const stats = await getUserListeningStats(userId);
    return jsonOk({ stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch listening stats";
    return jsonError(message, 500);
  }
}
