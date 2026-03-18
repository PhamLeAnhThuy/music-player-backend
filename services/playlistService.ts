import { supabaseAdmin } from "@/lib/supabase";
import { Playlist, PlaylistSong } from "@/types/domain";

async function normalizePlaylistSongPositions(playlistId: string) {
  const songsResult = await supabaseAdmin
    .from("playlist_songs")
    .select("spotify_track_id, position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });

  if (songsResult.error) {
    throw new Error(songsResult.error.message);
  }

  const songs = songsResult.data ?? [];
  for (let index = 0; index < songs.length; index += 1) {
    const song = songs[index];
    if (song.position === index) {
      continue;
    }

    const updateResult = await supabaseAdmin
      .from("playlist_songs")
      .update({ position: index })
      .eq("playlist_id", playlistId)
      .eq("spotify_track_id", song.spotify_track_id);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }
  }
}

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
  const existingResult = await supabaseAdmin
    .from("playlist_songs")
    .select("*")
    .eq("playlist_id", playlistId)
    .eq("spotify_track_id", spotifyTrackId)
    .maybeSingle();

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  if (existingResult.data) {
    await normalizePlaylistSongPositions(playlistId);

    const normalizedExistingResult = await supabaseAdmin
      .from("playlist_songs")
      .select("*")
      .eq("playlist_id", playlistId)
      .eq("spotify_track_id", spotifyTrackId)
      .maybeSingle();

    if (normalizedExistingResult.error) {
      throw new Error(normalizedExistingResult.error.message);
    }

    if (!normalizedExistingResult.data) {
      throw new Error("Failed to load playlist song");
    }

    return {
      song: normalizedExistingResult.data as PlaylistSong,
      alreadyExists: true,
    };
  }

  const result = await supabaseAdmin
    .from("playlist_songs")
    .insert({ playlist_id: playlistId, spotify_track_id: spotifyTrackId, position })
    .select("*")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  await normalizePlaylistSongPositions(playlistId);

  const normalizedSongResult = await supabaseAdmin
    .from("playlist_songs")
    .select("*")
    .eq("playlist_id", playlistId)
    .eq("spotify_track_id", spotifyTrackId)
    .maybeSingle();

  if (normalizedSongResult.error) {
    throw new Error(normalizedSongResult.error.message);
  }

  if (!normalizedSongResult.data) {
    throw new Error("Failed to load playlist song");
  }

  return {
    song: normalizedSongResult.data as PlaylistSong,
    alreadyExists: false,
  };
}

export async function listPlaylistSongs(playlistId: string) {
  const result = await supabaseAdmin
    .from("playlist_songs")
    .select("*")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as PlaylistSong[];
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

  await normalizePlaylistSongPositions(playlistId);
}

export async function reorderPlaylistSongs(
  playlistId: string,
  orders: Array<{ spotifyTrackId: string; position: number }>,
) {
  for (const item of orders) {
    const result = await supabaseAdmin
      .from("playlist_songs")
      .update({ position: item.position })
      .eq("playlist_id", playlistId)
      .eq("spotify_track_id", item.spotifyTrackId);

    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}
