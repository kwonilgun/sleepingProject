import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import TrackPlayer, { 
  Event, 
  AppKilledPlaybackBehavior,
  Capability
} from 'react-native-track-player';
import { baseURL } from '../../../assets/common/BaseUrl'; // 프로젝트 경로에 맞게 수정
import { PlaylistItem } from '../PlaylistScreen';

interface PlayerSetupHook {
  displayTitle: string;
  isLoading: boolean;
  currentTrack: PlaylistItem | null;
}

const usePlayerSetup = (
  route: { params?: { selectedTracks?: string[]; playlist?: PlaylistItem[] } },
  navigation: any
): PlayerSetupHook => {
  const [displayTitle, setDisplayTitle] = useState('선택된 곡 없음');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<PlaylistItem | null>(null);

  // 플레이어 초기 설정
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          // stopWithApp: false,
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

        // 파라미터 유효성 검사
        if (!route.params?.selectedTracks || route.params.selectedTracks.length === 0) {
          Alert.alert('오류', '재생할 곡이 선택되지 않았습니다.', [
            { text: '확인', onPress: () => navigation.goBack() }
          ]);
          return;
        }

        if (!route.params?.playlist || route.params.playlist.length === 0) {
          Alert.alert('오류', '플레이리스트 정보를 불러올 수 없습니다.', [
            { text: '확인', onPress: () => navigation.goBack() }
          ]);
          return;
        }

      } catch (error) {
        console.error('플레이어 설정 오류:', error);
        Alert.alert('오류', '음악 플레이어 초기화에 실패했습니다.');
      }
    };

    setupPlayer();

    return () => {
      TrackPlayer.reset();
    };
  }, [route.params, navigation]);

  // 트랙 로드 및 재생
  useEffect(() => {
    const loadTracks = async () => {
      if (!route.params?.selectedTracks || !route.params?.playlist) return;

      setIsLoading(true);
      try {
        const { selectedTracks, playlist } = route.params;

        const tracksToAdd = selectedTracks.map(uri => {
          const item = playlist.find(p => p.uri === uri && p.type === 'file');
          return item ? {
            id: item.id,
            url: `${baseURL}stream/${item.uri}`,
            title: item.name.replace(/\.mp3$/i, ''),
            artist: item.artist || 'Unknown',
            duration: item.duration || 0,
          } : null;
        }).filter(Boolean);

        await TrackPlayer.reset();
        await TrackPlayer.add(tracksToAdd as any);
        await TrackPlayer.play();

        // 현재 트랙 정보 업데이트
        const currentTrackId = await TrackPlayer.getCurrentTrack();
        if (currentTrackId) {
          const track = await TrackPlayer.getTrack(currentTrackId);
          setDisplayTitle(track?.title || '알 수 없는 곡');
          setCurrentTrack(
            playlist.find(item => item.id === String(currentTrackId)) || null
          );
        }

      } catch (error) {
        console.error('트랙 로드 오류:', error);
        Alert.alert('재생 오류', '선택된 곡을 재생할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [route.params]);

  // 현재 재생 중인 트랙 변경 감지
  useEffect(() => {
    const listener = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      async (event) => {
        if (event.track != null && route.params?.playlist) {
          const track = await TrackPlayer.getTrack(event.track);
          setDisplayTitle(track?.title || '알 수 없는 곡');
          setCurrentTrack(
            route.params.playlist.find(item => item.id === String(event.track)) || null
          );
        }
      }
    );

    return () => {
      listener.remove();
    };
  }, [route.params?.playlist]);

  return {
    displayTitle,
    isLoading,
    currentTrack,
  };
};

export default usePlayerSetup;