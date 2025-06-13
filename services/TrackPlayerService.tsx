// src/services/TrackPlayerService.ts
import TrackPlayer, {
  Event,
  Track,
  TrackMetadataBase,
} from 'react-native-track-player';

// Define your track metadata type (optional customization)
type CustomTrackMetadata = TrackMetadataBase & {
  title: string;
  artist: string;
  album?: string;
  artwork?: string; // Can be a URL or local image asset path
};

export async function playbackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (e) {
      console.warn('No next track:', e);
    }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (e) {
      console.warn('No previous track:', e);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.reset();
  });

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (data) => {
    if (data.nextTrack != null) {
      const track = (await TrackPlayer.getTrack(data.nextTrack)) as (Track & CustomTrackMetadata) | null;
      if (track) {
        await TrackPlayer.updateMetadataForTrack(data.nextTrack, {
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork: track.artwork,
        });
      }
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (data) => {
    console.log('Playback queue ended:', data);
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('Playback error:', error);
  });
}
