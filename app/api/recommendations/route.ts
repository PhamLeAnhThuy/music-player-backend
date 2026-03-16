import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { recommendSongs } from "@/services/recommendationService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const data = await recommendSongs(userId);
    return jsonOk(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get recommendations";
    return jsonError(message, 500);
  }
}
