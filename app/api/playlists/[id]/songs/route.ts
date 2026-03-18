import { jsonError, jsonOk } from "@/lib/http";
import { addSongToPlaylist, listPlaylistSongs } from "@/services/playlistService";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const songs = await listPlaylistSongs(id);
    return jsonOk({ songs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch playlist songs";
    return jsonError(message, 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = (await request.json()) as { spotifyTrackId?: string; position?: number };
    if (!body.spotifyTrackId) {
      return jsonError("spotifyTrackId is required", 400);
    }

    const { id } = await params;
    const song = await addSongToPlaylist(id, body.spotifyTrackId, body.position ?? 0);
    return jsonOk({ song }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add song";
    return jsonError(message, 500);
  }
}
