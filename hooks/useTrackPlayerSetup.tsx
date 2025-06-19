// src/hooks/useTrackPlayerSetup.ts
import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import TrackPlayer, {
  Event,
  usePlaybackState,
  useProgress,
  State,
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode,
} from 'react-native-track-player';
import { baseURL } from '../assets/common/BaseUrl';
import { PlaylistItem } from '../screens/Player/PlayerScreen'; // Import PlaylistItem interface

export enum RepeatMode {
  Off,
  RepeatOne,
  RepeatAll,
}

interface UseTrackPlayerSetupProps {
  selectedTracks: string[];
  playlist: PlaylistItem[];
  initialCurrentTrackIndex: number;
  setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const useTrackPlayerSetup = (
  selectedTracks: string[],
  playlist: PlaylistItem[],
  currentTrackIndex: number,
  setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [volume, setVolume] = useState<number>(0.3);
  const [prevVolume, setPrevVolume] = useState<number>(1.0); // To store volume before muting
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const isPlaying = playbackState.state === State.Playing;
  const isLoading = playbackState.state === State.Buffering || playbackState.state === State.Connecting;

  // Initial TrackPlayer setup
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
        console.error('TrackPlayer setup failed:', e);
        Alert.alert('오류', '음악 플레이어 설정에 실패했습니다.');
      }
    };

    setup();

    // TrackPlayer event listeners
    const listenerPlaybackActiveTrackChanged = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async data => {
      if (data.track !== undefined && data.track !== null) {
        const queue = await TrackPlayer.getQueue();
        const newIndex = queue.findIndex(t => t.id === data.track);
        if (newIndex > -1) {
          setCurrentTrackIndex(newIndex);
        }
      }
    });

    const listenerPlaybackQueueEnded = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      if (repeatMode === RepeatMode.Off) {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0);
      }
    });

    return () => {
      listenerPlaybackActiveTrackChanged.remove();
      listenerPlaybackQueueEnded.remove();
      // Optional: Stop TrackPlayer when component unmounts
      // TrackPlayer.destroy(); // Use with caution, might stop background playback
    //   const cleanupPlayer = async () => {
    //     try {
    //     //   await TrackPlayer.stop(); // 재생 중지
    //       await TrackPlayer.reset(); // 큐 초기화 및 리소스 해제
    //       console.log('TrackPlayer cleaned up on unmount.');
    //     } catch (e) {
    //       console.error('TrackPlayer cleanup failed:', e);
    //     }
    //   };
    //   cleanupPlayer();
    };
  }, []); // 의존성 배열을 비워 한 번만 실행되도록 함

  // Load selected tracks into TrackPlayer
  useEffect(() => {
    const loadTracks = async () => {
      if (selectedTracks.length === 0) {
        await TrackPlayer.stop();
        return;
      }

      const tracksToAdd = selectedTracks.map(uri => {
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

      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracksToAdd as any);
        await TrackPlayer.skip(currentTrackIndex);
        await TrackPlayer.play();
      } catch (e: any) {
        console.error('Playback error:', e);
        Alert.alert('재생 오류', `선택된 곡을 재생할 수 없습니다: ${e.message}`);
        await TrackPlayer.pause();
      }
    };
    loadTracks();
  }, [currentTrackIndex, playlist, selectedTracks]); // 이 의존성들은 TrackPlayer 큐를 다시 로드해야 할 때 사용

  // Set repeat mode
  useEffect(() => {
    const setRepeat = async () => {
      const mode =
        repeatMode === RepeatMode.Off
          ? TrackPlayerRepeatMode.Off
          : repeatMode === RepeatMode.RepeatOne
            ? TrackPlayerRepeatMode.Track
            : TrackPlayerRepeatMode.Queue;
      await TrackPlayer.setRepeatMode(mode);
    };
    setRepeat();
  }, [repeatMode]); // repeatMode가 변경될 때만 실행

  // 4. 볼륨 설정 (volume 상태 변경 시)
  useEffect(() => {
    const setPlayerVolume = async () => {
      await TrackPlayer.setVolume(volume);
    };
    setPlayerVolume();
  }, [volume]);

  // Playback controls
  const togglePlayback = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

   // 5. 컴포넌트 언마운트 시 TrackPlayer 정리 (뒤로 가기 등)
  useEffect(() => {
    return () => {
      const cleanupPlayerOnUnmount = async () => {
        try {
          await TrackPlayer.stop(); // 재생 중지
          await TrackPlayer.reset(); // 큐 초기화 및 리소스 해제
          console.log('TrackPlayer cleaned up on PlayerScreen unmount.');
        } catch (e) {
          console.error('TrackPlayer cleanup failed on unmount:', e);
        }
      };
      cleanupPlayerOnUnmount();
    };
  }, []); // 의존성 배열을 비워 컴포넌트 언마운트 시에만 실행되도록 함

  const handleSkipPrevious = async () => {
    const currentPosition = progress.position;
    if (currentPosition > 3 || currentTrackIndex === 0) {
      await TrackPlayer.seekTo(0);
    } else if (currentTrackIndex > 0) {
      await TrackPlayer.skipToPrevious();
    }
  };

  const handleSkipNext = async () => {
    if (currentTrackIndex < selectedTracks.length - 1) {
      await TrackPlayer.skipToNext();
    } else {
      if (repeatMode === RepeatMode.RepeatAll) {
        await TrackPlayer.skip(0); // Go back to first track in queue
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0);
      }
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode((prevMode) => {
      switch (prevMode) {
        case RepeatMode.Off:
          return RepeatMode.RepeatOne;
        case RepeatMode.RepeatOne:
          return RepeatMode.RepeatAll;
        case RepeatMode.RepeatAll:
          return RepeatMode.Off;
        default:
          return RepeatMode.Off;
      }
    });
  };

  const toggleMute = async () => {
    if (isMuted) {
      await TrackPlayer.setVolume(prevVolume);
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      await TrackPlayer.setVolume(0);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return {
    playbackState,
    progress,
    repeatMode,
    volume,
    isMuted,
    togglePlayback,
    handleSkipPrevious,
    handleSkipNext,
    toggleRepeatMode,
    setVolume,
    toggleMute,
    isPlaying,
    isLoading,
  };
};