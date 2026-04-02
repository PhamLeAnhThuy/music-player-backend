import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { removeSongFromPlaylistForUser } from "@/services/playlistService";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
    trackId: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const { id, trackId } = await params;
    await removeSongFromPlaylistForUser(userId, id, trackId);
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove song";
    return jsonError(message, 500);
  }
}
