import { getUserIdFromRequest, jsonError, jsonOk } from "@/lib/http";
import { addSongToPlaylistForUser, listPlaylistSongsForUser, reorderPlaylistSongsForUser } from "@/services/playlistService";
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
    const songs = await listPlaylistSongsForUser(userId, id);
    return jsonOk({ songs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch playlist songs";
    return jsonError(message, 500);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const body = (await request.json()) as { spotifyTrackId?: string; position?: number };
    if (!body.spotifyTrackId) {
      return jsonError("spotifyTrackId is required", 400);
    }

    const { id } = await params;
    const result = await addSongToPlaylistForUser(userId, id, body.spotifyTrackId, body.position ?? 0);
    return jsonOk(result, result.alreadyExists ? 200 : 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add song";
    return jsonError(message, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError("x-user-id header is required", 401);
    }

    const body = (await request.json()) as { orders?: Array<{ spotifyTrackId: string; position: number }> };
    if (!body.orders || !Array.isArray(body.orders) || body.orders.length === 0) {
      return jsonError("orders is required", 400);
    }

    const hasInvalidItem = body.orders.some(
      (item) => !item?.spotifyTrackId || typeof item.position !== "number" || item.position < 0,
    );
    if (hasInvalidItem) {
      return jsonError("orders contains invalid item", 400);
    }

    const { id } = await params;
    await reorderPlaylistSongsForUser(userId, id, body.orders);
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reorder songs";
    return jsonError(message, 500);
  }
}
