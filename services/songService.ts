import { getAlbumTracks, getArtist, getTrack, searchTracks } from "@/lib/spotify";

const MAX_PREVIEW_LOOKUPS = 8;

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

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
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
                url: item.artworkUrl100,
                height: 100,
                width: 100,
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
  const track = await getTrack(trackId);

  const albumId = track.album.id;
  const artistId = track.artists[0]?.id;

  const [albumTracks, artist] = await Promise.all([
    albumId ? getAlbumTracks(albumId) : Promise.resolve({ items: [] }),
    artistId ? getArtist(artistId) : Promise.resolve(null),
  ]);

  return {
    track,
    albumTracks,
    artist,
  };
}
