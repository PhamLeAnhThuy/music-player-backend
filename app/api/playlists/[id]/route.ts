import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { deletePlaylist } from "@/services/playlistService";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const { id } = await params;
    await deletePlaylist(userId, id);
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete playlist";
    return jsonError(message, 500);
  }
}
