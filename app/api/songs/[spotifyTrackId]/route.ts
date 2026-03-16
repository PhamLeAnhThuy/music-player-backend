import { jsonError, jsonOk } from "@/lib/http";
import { getSong } from "@/services/songService";

type RouteParams = {
  params: Promise<{
    spotifyTrackId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { spotifyTrackId } = await params;
    const data = await getSong(spotifyTrackId);
    return jsonOk(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch song";
    return jsonError(message, 500);
  }
}
