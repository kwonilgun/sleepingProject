import { useEffect } from 'react';
import { Alert } from 'react-native';
import TrackPlayer, {
  Event,
  State,
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode,
  RepeatMode,
  PlaybackState,
} from 'react-native-track-player';
import { PlaylistItem } from '../PlaylistScreen';
import { baseURL } from '../../../assets/common/BaseUrl';
// import { RepeatMode } from '../PlayerScreen';
// import { PlaylistItem } from '../model/types/TUserNavigator'; // Adjust path as necessary
// import { baseURL } from '../../assets/common/BaseUrl'; // Adjust path as necessary

interface UseTrackPlayerSetupProps {
  repeatMode: number; // Use number corresponding to RepeatMode enum
  playbackState: PlaybackState | { state: undefined; }
  volume: number;
  currentTrackIndex:number;
  selectedTracks: string[];
  playlist: PlaylistItem[];
  setCurrentTrackIndex: (index: number) => void;
  setDisplayTitle: (title: string) => void;
  sleepTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  setSleepTimerActive: (active: boolean) => void;
  sleepTimerCountRef: React.MutableRefObject<number>;
  // RepeatModeEnum: any; // Pass the enum itself
}

export const useTrackPlayerSetup = ({
  repeatMode,
  playbackState,
  volume,
  currentTrackIndex,
  selectedTracks,
  playlist,
  setCurrentTrackIndex,
  setDisplayTitle,
  sleepTimerRef,
  setSleepTimerActive,
  sleepTimerCountRef,
  // RepeatModeEnum
}: UseTrackPlayerSetupProps) => {

  
    useEffect(() => {
      console.log('Current Playback State:', playbackState);
      // If playback stops for any reason other than the sleep timer, clear the sleep timer
      if (playbackState.state === State.Stopped || playbackState.state === State.Paused) {
        // if (sleepTimerRef.current) {
        //   clearTimeout(sleepTimerRef.current);
        //   sleepTimerRef.current = null;
        //   setSleepTimerActive(false);
        //   sleepTimerCountRef.current = 0; // Reset count when playback stops/pauses
  
        // }
      }
    }, [playbackState]);
  
// 플레이어 초기 설정
  useEffect(() => {
    const setup = async () => {
      try {
        await TrackPlayer.updateOptions({
          stopWithApp: false,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
          },
        });
        await TrackPlayer.setVolume(volume);
      } catch (e) {
        console.error(e);
        Alert.alert('오류', '음악 플레이어 설정에 실패했습니다.');
      }
    };

    setup();

    const listenerPlaybackActiveTrackChanged = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async data => {
      if (data.track !== undefined && data.track !== null) {
        setDisplayTitle(data.track?.title!);
        const queue = await TrackPlayer.getQueue();
        const newIndex = queue.findIndex(t => t.id === data.track);
        if (newIndex > -1) {
          setCurrentTrackIndex(newIndex);
        }
      }
    });

    const listenerPlaybackQueueEnded = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async data => {
      if (repeatMode === RepeatMode.Off) {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0);
        if (sleepTimerRef.current) {
          clearTimeout(sleepTimerRef.current);
          sleepTimerRef.current = null;
          setSleepTimerActive(false);
          sleepTimerCountRef.current = 0;
        }
      }
    });

    return () => {
      listenerPlaybackActiveTrackChanged.remove();
      listenerPlaybackQueueEnded.remove();
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [repeatMode, volume, setCurrentTrackIndex, setDisplayTitle, sleepTimerRef, setSleepTimerActive, sleepTimerCountRef]);

// 트랙 로드 및 재생
  useEffect(() => {
    const load = async () => {
      if (selectedTracks.length === 0) {
        await TrackPlayer.stop();
        return;
      }

      const tracksToAdd = selectedTracks.map(uri => {
        console.log('tracksToAdd uri: ', uri)
        const item = playlist.find(p => p.uri === uri && p.type === 'file');
        if (item) {
          return {
            id: item.id,
            url: `${baseURL}stream/${item.uri}`,
            title: item.name.replace(/\.mp3$/i, ''),
            artist: item.artist || 'Unknown',
            duration: item.duration || 0,
          };
        }
        return null;
      }).filter(Boolean);

      console.log('tracksToAdd :', tracksToAdd);

      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracksToAdd as any);
        await TrackPlayer.skip(currentTrackIndex);
        await TrackPlayer.play();      //실제적으로 play가 진행이 된다.
      } catch (e) {
        console.error('재생 오류:', e);
        Alert.alert('재생 오류', `선택된 곡을 재생할 수 없습니다: ${e.message}`);
        await TrackPlayer.pause();
      }
    };
    load();
  }, [currentTrackIndex, playlist, selectedTracks]);

  useEffect(() => {
    const playCurrentTrack = async () => {
      if (selectedTracks.length > 0 && currentTrackIndex >= 0 && currentTrackIndex < selectedTracks.length) {
        try {
          const queue = await TrackPlayer.getQueue();
          if (queue.length > 0) {
            await TrackPlayer.skip(currentTrackIndex);
            await TrackPlayer.play();
          }
        } catch (e) {
          console.error('스킵 오류:', e);
          Alert.alert('재생 오류', '다음 곡으로 이동할 수 없습니다.');
          await TrackPlayer.pause();
        }
      }
    };
    playCurrentTrack();
  }, [currentTrackIndex, selectedTracks]);

  useEffect(() => {
      const setRepeat = async () => {
      console.log('repeatMode useEffect fired. New mode:', repeatMode);

      const mode =
        repeatMode === RepeatMode.Off
          ? TrackPlayerRepeatMode.Off
          : repeatMode === RepeatMode.Track
            ? TrackPlayerRepeatMode.Track
            : TrackPlayerRepeatMode.Queue;
      await TrackPlayer.setRepeatMode(mode);
    };
    setRepeat();
  }, [repeatMode]);
};

export { RepeatMode };
