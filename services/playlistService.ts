import { supabaseAdmin } from "@/lib/supabase";
import { Playlist, PlaylistSong } from "@/types/domain";

export async function listPlaylists(userId: string): Promise<Playlist[]> {
  const result = await supabaseAdmin
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function createPlaylist(userId: string, name: string, description?: string, cover_url?: string) {
  const result = await supabaseAdmin
    .from("playlists")
    .insert({ user_id: userId, name, description: description ?? null, cover_url: cover_url ?? null })
    .select("*")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data as Playlist;
}

export async function deletePlaylist(userId: string, playlistId: string) {
  const result = await supabaseAdmin.from("playlists").delete().eq("id", playlistId).eq("user_id", userId);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function addSongToPlaylist(playlistId: string, spotifyTrackId: string, position: number) {
  const result = await supabaseAdmin
    .from("playlist_songs")
    .insert({ playlist_id: playlistId, spotify_track_id: spotifyTrackId, position })
    .select("*")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data as PlaylistSong;
}

export async function removeSongFromPlaylist(playlistId: string, spotifyTrackId: string) {
  const result = await supabaseAdmin
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("spotify_track_id", spotifyTrackId);

  if (result.error) {
    throw new Error(result.error.message);
  }
}
