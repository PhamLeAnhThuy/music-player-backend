export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
};

export type PlaylistSong = {
  playlist_id: string;
  spotify_track_id: string;
  position: number;
  added_at: string;
};
