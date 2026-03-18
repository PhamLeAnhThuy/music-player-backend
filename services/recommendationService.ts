import { getRecommendations } from "@/lib/spotify";
import { supabaseAdmin } from "@/lib/supabase";
import { searchSongs } from "@/services/songService";

export async function recommendSongs(userId: string) {
  const [historyResult, prefResult] = await Promise.all([
    supabaseAdmin
      .from("listening_history")
      .select("spotify_track_id")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(10),
    supabaseAdmin.from("user_preferences").select("favorite_genres").eq("user_id", userId).maybeSingle(),
  ]);

  if (historyResult.error) {
    throw new Error(historyResult.error.message);
  }

  if (prefResult.error) {
    throw new Error(prefResult.error.message);
  }

  const seedTracks = (historyResult.data ?? []).map((item) => item.spotify_track_id).slice(0, 5);
  const seedGenres = (prefResult.data?.favorite_genres ?? ["pop", "rock"]).slice(0, 2);

  if (seedTracks.length === 0) {
    seedTracks.push("11dFghVXANMlKmJXsNCbNl");
  }

  try {
    return await getRecommendations(seedGenres, seedTracks, 20);
  } catch {
    // Fallback keeps the app usable when Spotify recommendation endpoint fails.
    const fallback = await searchSongs("top hits", 20);
    return {
      tracks: fallback.tracks.items,
    };
  }
}
