import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { createPlaylist, listPlaylists } from "@/services/playlistService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const playlists = await listPlaylists(userId);
    return jsonOk({ playlists });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch playlists";
    return jsonError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      cover_url?: string;
    };

    if (!body.name) {
      return jsonError("name is required", 400);
    }

    const playlist = await createPlaylist(userId, body.name, body.description, body.cover_url);
    return jsonOk({ playlist }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create playlist";
    return jsonError(message, 500);
  }
}
