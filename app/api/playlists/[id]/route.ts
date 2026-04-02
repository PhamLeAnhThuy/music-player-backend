import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { deletePlaylist, getPlaylistById, updatePlaylist } from "@/services/playlistService";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const { id } = await params;
    const playlist = await getPlaylistById(userId, id);
    if (!playlist) {
      return jsonError("Playlist not found", 404);
    }

    return jsonOk({ playlist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch playlist";
    return jsonError(message, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string | null;
      cover_url?: string | null;
    };

    if (
      body.name === undefined
      && body.description === undefined
      && body.cover_url === undefined
    ) {
      return jsonError("At least one field is required", 400);
    }

    if (typeof body.name === "string" && !body.name.trim()) {
      return jsonError("name cannot be empty", 400);
    }

    const { id } = await params;
    const playlist = await updatePlaylist(userId, id, body);
    return jsonOk({ playlist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update playlist";
    return jsonError(message, 500);
  }
}

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
