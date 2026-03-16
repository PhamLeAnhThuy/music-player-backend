import { getAlbumTracks, getArtist, getTrack, searchTracks } from "@/lib/spotify";

export async function searchSongs(query: string, limit = 20) {
  return searchTracks(query, limit);
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
