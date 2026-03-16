import { jsonError, jsonOk } from "@/lib/http";
import { removeSongFromPlaylist } from "@/services/playlistService";

type RouteParams = {
  params: Promise<{
    id: string;
    trackId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id, trackId } = await params;
    await removeSongFromPlaylist(id, trackId);
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove song";
    return jsonError(message, 500);
  }
}
