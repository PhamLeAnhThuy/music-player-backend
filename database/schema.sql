create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  created_at timestamptz default now() not null
);

create table if not exists playlist_songs (
  playlist_id uuid references playlists(id) on delete cascade,
  spotify_track_id text not null,
  position integer not null,
  added_at timestamptz default now() not null,
  primary key (playlist_id, spotify_track_id)
);

create table if not exists liked_songs (
  user_id uuid references users(id) on delete cascade,
  spotify_track_id text not null,
  liked_at timestamptz default now() not null,
  primary key (user_id, spotify_track_id)
);

create table if not exists listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  spotify_track_id text not null,
  played_at timestamptz default now() not null,
  duration integer default 0 not null
);

create table if not exists user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  favorite_genres text[] default '{}',
  favorite_artists text[] default '{}',
  created_at timestamptz default now() not null
);

create index if not exists idx_playlists_user_id on playlists(user_id);
create index if not exists idx_listening_history_user_id on listening_history(user_id);
create index if not exists idx_listening_history_played_at on listening_history(played_at desc);
