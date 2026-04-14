import { supabaseAdmin } from "@/lib/supabase";
import { getArtist, getTrack } from "@/lib/spotify";
import { UserProfile } from "@/types/domain";

export type UserListeningStats = {
  totalListeningSeconds: number;
  topGenres: string[];
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await supabaseAdmin.from("users").select("*").eq("id", userId).maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function updateUserProfile(userId: string, payload: Partial<Pick<UserProfile, "name" | "avatar_url">>) {
  const result = await supabaseAdmin
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getUserListeningStats(userId: string): Promise<UserListeningStats> {
  const pastWeekDate = new Date();
  pastWeekDate.setDate(pastWeekDate.getDate() - 7);

  const result = await supabaseAdmin
    .from("listening_history")
    .select("spotify_track_id, duration, played_at")
    .eq("user_id", userId)
    .gte("played_at", pastWeekDate.toISOString())
    .order("played_at", { ascending: false })
    .limit(200);

  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = result.data ?? [];
  const totalListeningSeconds = rows.reduce((sum, row) => sum + Math.max(0, Number(row.duration) || 0), 0);
  const trackPlayCounts = new Map<string, number>();
  for (const row of rows) {
    const count = trackPlayCounts.get(row.spotify_track_id) ?? 0;
    trackPlayCounts.set(row.spotify_track_id, count + 1);
  }

  const topTrackIds = [...trackPlayCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([trackId]) => trackId);

  const tracks = await Promise.all(topTrackIds.map(async (trackId) => {
    try {
      const track = await getTrack(trackId);
      return track;
    } catch {
      return null;
    }
  }));

  const artistPlayCounts = new Map<string, { name: string; plays: number }>();
  for (const track of tracks) {
    if (!track) {
      continue;
    }

    const plays = trackPlayCounts.get(track.id) ?? 0;
    for (const artist of track.artists) {
      const existing = artistPlayCounts.get(artist.id);
      if (existing) {
        existing.plays += plays;
      } else {
        artistPlayCounts.set(artist.id, { name: artist.name, plays });
      }
    }
  }

  const topArtistIds = [...artistPlayCounts.entries()]
    .sort((a, b) => b[1].plays - a[1].plays)
    .slice(0, 10)
    .map(([artistId]) => artistId);

  const artists = await Promise.all(topArtistIds.map(async (artistId) => {
    try {
      const artist = await getArtist(artistId);
      return artist;
    } catch {
      return null;
    }
  }));

  const genreCounts = new Map<string, number>();
  for (const artist of artists) {
    if (!artist?.genres?.length) {
      continue;
    }

    const plays = artistPlayCounts.get(artist.id)?.plays ?? 1;
    for (const genre of artist.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + plays);
    }
  }

  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  return {
    totalListeningSeconds,
    topGenres,
  };
}
