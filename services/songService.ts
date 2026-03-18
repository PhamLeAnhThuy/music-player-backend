import { getAlbumTracks, getArtist, getTrack, searchTracks } from "@/lib/spotify";

const MAX_PREVIEW_LOOKUPS = 8;
const LYRICS_TIMEOUT_MS = 3500;

type ItunesSearchResponse = {
  results?: Array<{
    trackId?: number;
    previewUrl?: string;
    trackName?: string;
    artistName?: string;
    collectionName?: string;
    artworkUrl100?: string;
    trackTimeMillis?: number;
  }>;
};

type LyricsPayload = {
  synced: string | null;
  plain: string | null;
  provider: "lrclib";
} | null;

type LrcLibResponse = {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function upscaleItunesArtworkUrl(url: string | undefined) {
  if (!url) {
    return null;
  }

  return url.replace(/\/[0-9]+x[0-9]+bb/i, "/1200x1200bb");
}

async function fetchLyrics(trackName: string, artistName: string, albumName?: string, durationMs?: number): Promise<LyricsPayload> {
  const params = new URLSearchParams();
  params.set("track_name", trackName);
  params.set("artist_name", artistName);

  if (albumName) {
    params.set("album_name", albumName);
  }

  if (typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs > 0) {
    params.set("duration", String(Math.round(durationMs / 1000)));
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), LYRICS_TIMEOUT_MS);

  try {
    const response = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      cache: "no-store",
      signal: abortController.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LrcLibResponse;
    const synced = payload.syncedLyrics?.trim() || null;
    const plain = payload.plainLyrics?.trim() || null;

    if (!synced && !plain) {
      return null;
    }

    return {
      synced,
      plain,
      provider: "lrclib",
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function findItunesPreviewUrl(trackName: string, artistName: string): Promise<string | null> {
  const term = encodeURIComponent(`${trackName} ${artistName}`.trim());
  const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=5`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ItunesSearchResponse;
  const results = payload.results ?? [];
  if (!results.length) {
    return null;
  }

  const expectedTrack = normalizeText(trackName);
  const expectedArtist = normalizeText(artistName);

  const bestMatch =
    results.find((item) => {
      const candidateTrack = normalizeText(item.trackName ?? "");
      const candidateArtist = normalizeText(item.artistName ?? "");

      return candidateTrack.includes(expectedTrack) && candidateArtist.includes(expectedArtist);
    }) ?? results[0];

  return bestMatch.previewUrl ?? null;
}

async function searchItunesTracks(query: string, limit: number) {
  const term = encodeURIComponent(query.trim());
  const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=${limit}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`iTunes API error (${response.status})`);
  }

  const payload = (await response.json()) as ItunesSearchResponse;
  const items = (payload.results ?? [])
    .filter((item) => item.trackName && item.artistName)
    .map((item, index) => ({
      id: item.trackId ? String(item.trackId) : `itunes-${index}-${normalizeText(item.trackName ?? "track")}`,
      name: item.trackName as string,
      duration_ms: item.trackTimeMillis ?? 30_000,
      preview_url: item.previewUrl ?? null,
      artists: [{ id: "itunes", name: item.artistName as string }],
      album: {
        id: `itunes-album-${index}`,
        name: item.collectionName ?? "Unknown Album",
        images: item.artworkUrl100
          ? [
              {
                url: upscaleItunesArtworkUrl(item.artworkUrl100) as string,
                height: 1200,
                width: 1200,
              },
            ]
          : [],
      },
      external_urls: {
        spotify: "",
      },
    }));

  return {
    tracks: {
      items,
      total: items.length,
      limit,
      offset: 0,
    },
  };
}

async function lookupItunesTrackById(trackId: string) {
  const response = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(trackId)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`iTunes lookup failed (${response.status})`);
  }

  const payload = (await response.json()) as ItunesSearchResponse;
  const item = (payload.results ?? []).find((result) => result.trackName && result.artistName);

  if (!item || !item.trackName || !item.artistName) {
    throw new Error("Track not found");
  }

  const lyrics = await fetchLyrics(
    item.trackName,
    item.artistName,
    item.collectionName,
    item.trackTimeMillis,
  );

  const imageUrl = upscaleItunesArtworkUrl(item.artworkUrl100);
  return {
    track: {
      id: item.trackId ? String(item.trackId) : trackId,
      name: item.trackName,
      duration_ms: item.trackTimeMillis ?? 30_000,
      preview_url: item.previewUrl ?? null,
      artists: [{ id: "itunes", name: item.artistName }],
      album: {
        id: `itunes-album-${item.trackId ?? trackId}`,
        name: item.collectionName ?? "Unknown Album",
        images: imageUrl
          ? [
              {
                url: imageUrl,
                height: 1200,
                width: 1200,
              },
            ]
          : [],
      },
      external_urls: {
        spotify: "",
      },
    },
    albumTracks: { items: [] },
    artist: null,
    lyrics,
  };
}

export async function searchSongs(query: string, limit = 20) {
  let data;

  try {
    data = await searchTracks(query, limit);
  } catch {
    return searchItunesTracks(query, limit);
  }

  const items = data.tracks.items;

  const missingPreviewItems = items.filter((item) => !item.preview_url).slice(0, MAX_PREVIEW_LOOKUPS);
  if (!missingPreviewItems.length) {
    return data;
  }

  const fallbackEntries = await Promise.all(
    missingPreviewItems.map(async (item) => {
      try {
        const fallbackPreview = await findItunesPreviewUrl(item.name, item.artists[0]?.name ?? "");
        return [item.id, fallbackPreview] as const;
      } catch {
        return [item.id, null] as const;
      }
    }),
  );

  const fallbackMap = new Map(fallbackEntries);
  const enrichedItems = items.map((item) => {
    if (item.preview_url) {
      return item;
    }

    const fallbackPreview = fallbackMap.get(item.id) ?? null;
    return {
      ...item,
      preview_url: fallbackPreview,
    };
  });

  return {
    ...data,
    tracks: {
      ...data.tracks,
      items: enrichedItems,
    },
  };
}

export async function getSong(trackId: string) {
  try {
    const track = await getTrack(trackId);

    const albumId = track.album.id;
    const artistId = track.artists[0]?.id;

    const [albumTracks, artist, lyrics] = await Promise.all([
      albumId ? getAlbumTracks(albumId) : Promise.resolve({ items: [] }),
      artistId ? getArtist(artistId) : Promise.resolve(null),
      fetchLyrics(track.name, track.artists[0]?.name ?? "", track.album?.name, track.duration_ms),
    ]);

    return {
      track,
      albumTracks,
      artist,
      lyrics,
    };
  } catch {
    return lookupItunesTrackById(trackId);
  }
}
