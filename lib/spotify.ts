import { env } from "@/lib/env";
import { SpotifyRecommendationsResponse, SpotifySearchResponse, SpotifyTrack } from "@/types/spotify";

type AccessTokenState = {
  token: string;
  expiresAt: number;
};

let tokenState: AccessTokenState | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenState && tokenState.expiresAt > now + 10_000) {
    return tokenState.token;
  }

  const credentials = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with Spotify");
  }

  const payload = (await response.json()) as { access_token: string; expires_in: number };
  tokenState = {
    token: payload.access_token,
    expiresAt: now + payload.expires_in * 1000,
  };

  return payload.access_token;
}

async function spotifyFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = await getAccessToken();
  const query = new URLSearchParams(params).toString();
  const url = `https://api.spotify.com/v1/${path}${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify API error (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export async function searchTracks(query: string, limit = 20): Promise<SpotifySearchResponse> {
  return spotifyFetch<SpotifySearchResponse>("search", {
    q: query,
    type: "track",
    market: "US",
    limit: String(limit),
  });
}

export async function getTrack(trackId: string): Promise<SpotifyTrack> {
  return spotifyFetch<SpotifyTrack>(`tracks/${trackId}`, { market: "US" });
}

export async function getAlbumTracks(albumId: string) {
  return spotifyFetch<{ items: SpotifyTrack[] }>(`albums/${albumId}/tracks`, { market: "US" });
}

export async function getArtist(artistId: string) {
  return spotifyFetch<{ id: string; name: string; genres: string[]; followers: { total: number } }>(`artists/${artistId}`);
}

export async function getRecommendations(seedGenres: string[], seedTracks: string[], limit = 20): Promise<SpotifyRecommendationsResponse> {
  const boundedGenres = seedGenres.slice(0, 2);
  const boundedTracks = seedTracks.slice(0, 3);

  return spotifyFetch<SpotifyRecommendationsResponse>("recommendations", {
    market: "US",
    limit: String(limit),
    seed_genres: boundedGenres.join(","),
    seed_tracks: boundedTracks.join(","),
  });
}
