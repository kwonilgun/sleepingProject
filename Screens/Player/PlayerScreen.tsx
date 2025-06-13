/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
// src/screens/PlayerScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { baseURL } from '../../assets/common/BaseUrl';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import { RFPercentage } from 'react-native-responsive-fontsize';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import TrackPlayer, {
  Event,
  usePlaybackState,
  useProgress,
  State,
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode,
} from 'react-native-track-player';
import { width } from '../../styles/responsiveSize';

interface PlaylistItem {
  id: string;
  name: string;
  title?: string;
  artist?: string;
  path: string;
  type: 'file' | 'folder';
  uri?: string;
  duration?: number;
  isSelected?: boolean;
  isDirectoryOpen?: boolean;
  children?: PlaylistItem[];
  depth?: number;
}

interface PlayerScreenProps {
  route: { params: { selectedTracks: string[]; playlist: PlaylistItem[] } };
  navigation: any;
}

enum RepeatMode {
  Off,
  RepeatOne,
  RepeatAll,
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [volume, setVolume] = useState<number>(0.5);
  const [prevVolume, setPrevVolume] = useState<number>(1.0); // To store volume before muting
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [displayTitle, setDisplayTitle] = useState('선택된 곡 없음');


  const { selectedTracks, playlist } = route.params;
  const currentUri = selectedTracks[currentTrackIndex];
  let currentTrack = playlist.find(item => item.uri === currentUri && item.type === 'file');

  useEffect(() => {
    console.log('Current Playback State:', playbackState);
  }, [playbackState]);

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

    // PlaybackActiveTrackChanged 이벤트 리스너를 통해 현재 트랙 인덱스 업데이트
    const listenerPlaybackActiveTrackChanged = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async data => {
      console.log('listenerPlaybackActiveTrackChanged  data', data);
      if (data.track !== undefined && data.track !== null) {
        setDisplayTitle(data.track?.title!)
        const queue = await TrackPlayer.getQueue();
        const newIndex = queue.findIndex(t => t.id === data.track);
        if (newIndex > -1) {
          setCurrentTrackIndex(newIndex);
        }
      }
    });

    // PlaybackQueueEnded 이벤트 리스너: 큐가 끝났을 때만 (Repeat All이 아닌 경우) 처리
    const listenerPlaybackQueueEnded = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async data => {
      console.log('listenerPlaybackQueueEnded data ', data);
      if (repeatMode === RepeatMode.Off) {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0); // 첫 곡으로 돌아가기 (재생은 멈춤)
      }
      // RepeatMode.RepeatAll 이면 TrackPlayer가 자동으로 큐를 반복하므로 여기서는 특별히 처리할 필요 없음.
    });

    return () => {
      listenerPlaybackActiveTrackChanged.remove();
      listenerPlaybackQueueEnded.remove();
    };
  }, [repeatMode, volume]); // repeatMode가 변경될 때마다 리스너가 다시 등록되도록 의존성 배열에 추가

  useEffect(() => {
    const load = async () => {
      if (selectedTracks.length === 0) {
        await TrackPlayer.stop();
        return;
      }

      // 플레이리스트에 모든 선택된 트랙을 추가
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
      }).filter(Boolean); // null 값 제거

      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracksToAdd as any); // TrackPlayer.add는 ITrack[]을 기대하지만, PlaylistItem[]도 가능
        // 현재 트랙 인덱스에 해당하는 곡부터 재생 시작
        await TrackPlayer.skip(currentTrackIndex);
        await TrackPlayer.play();
      } catch (e) {
        console.error('재생 오류:', e);
        Alert.alert('재생 오류', `선택된 곡을 재생할 수 없습니다: ${e.message}`);
        await TrackPlayer.pause();
      }
    };
    load();
  }, [currentTrackIndex, playlist, selectedTracks]); // 선택된 트랙 목록이 변경될 때마다 플레이어 리셋 및 로드

  // currentTrackIndex가 변경될 때마다 TrackPlayer가 해당 트랙으로 스킵하고 재생하도록
  useEffect(() => {
    const playCurrentTrack = async () => {
      if (selectedTracks.length > 0 && currentTrackIndex >= 0 && currentTrackIndex < selectedTracks.length) {
        try {
          // TrackPlayer의 내부 큐가 이미 모든 곡을 가지고 있다면, 스킵만으로 충분
          const queue = await TrackPlayer.getQueue();
          if (queue.length > 0) {
            await TrackPlayer.skip(currentTrackIndex);
            await TrackPlayer.play();
          } else {
            // 큐가 비어있다면 (예: 초기 로드 시), 다시 로드 로직을 호출
            // 이 부분은 load useEffect와 중복될 수 있으므로, 초기 로드 시퀀스를 잘 고려해야 함
            // 여기서는 selectedTracks useEffect에 의해 한 번에 모든 곡이 로드되는 것을 가정
          }
        } catch (e) {
          console.error('스킵 오류:', e);
          Alert.alert('재생 오류', '다음 곡으로 이동할 수 없습니다.');
          await TrackPlayer.pause();
        }
      }
    };
    playCurrentTrack();
  }, [currentTrackIndex, selectedTracks]); // currentTrackIndex나 selectedTracks 변경 시 재생 트리거

  useEffect(() => {
    const setRepeat = async () => {
      const mode =
        repeatMode === RepeatMode.Off
          ? TrackPlayerRepeatMode.Off
          : repeatMode === RepeatMode.RepeatOne
            ? TrackPlayerRepeatMode.Track
            : TrackPlayerRepeatMode.Queue; // RepeatMode.RepeatAll
      await TrackPlayer.setRepeatMode(mode);
    };
    setRepeat();
  }, [repeatMode]);

  const togglePlayback = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleSkipPrevious = async () => {
    const currentPosition = progress.position;
    if (currentPosition > 3 || currentTrackIndex === 0) {
      await TrackPlayer.seekTo(0);
    } else if (currentTrackIndex > 0) {
      await TrackPlayer.skipToPrevious();
      // TrackPlayer.skipToPrevious()가 성공하면 PlaybackActiveTrackChanged 이벤트가 발생하고,
      // 그 이벤트 리스너가 setCurrentTrackIndex를 업데이트할 것입니다.
    }
  };

  const handleSkipNext = async () => {
    if (currentTrackIndex < selectedTracks.length - 1) {
      await TrackPlayer.skipToNext();
      // TrackPlayer.skipToNext()가 성공하면 PlaybackActiveTrackChanged 이벤트가 발생하고,
      // 그 이벤트 리스너가 setCurrentTrackIndex를 업데이트할 것입니다.
    } else {
      // 마지막 트랙일 경우 Repeat All 모드이면 TrackPlayer가 알아서 반복
      if (repeatMode === RepeatMode.RepeatAll) {
        // TrackPlayer.skipToNext()는 큐의 끝이면 다시 첫 곡으로 돌아갈 수도 있습니다.
        // 하지만 TrackPlayerRepeatMode.Queue가 설정되어 있다면 자동으로 반복됩니다.
        // 따라서 여기서는 특별히 setCurrentTrackIndex(0)을 호출할 필요가 없습니다.
        // 만약 TrackPlayer.skipToNext()가 큐의 끝에서 동작하지 않는다면, 수동으로 skip(0)을 호출할 수 있습니다.
        // await TrackPlayer.skip(0);
      } else {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0); // 재생 멈추고 첫 곡으로 돌아감
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

  const getRepeatButtonIcon = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return 'repeat-off';
      case RepeatMode.RepeatOne:
        return 'repeat-once';
      case RepeatMode.RepeatAll:
        return 'repeat';
      default:
        return 'undo';
    }
  };

  const getRepeatButtonColor = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return '#800080'; // Purple for off
      case RepeatMode.RepeatOne:
        return '#FFA500'; // Orange for repeat one
      case RepeatMode.RepeatAll:
        return '#007bff'; // Blue for repeat all
      default:
        return '#800080';
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isPlaying = playbackState.state === State.Playing;
  const isLoading = playbackState.state === State.Buffering || playbackState.state === State.Connecting;

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <FontAwesome
          style={{
            height: RFPercentage(8),
            width: RFPercentage(10),
            marginTop: RFPercentage(2),
            color: colors.black,
            fontSize: RFPercentage(5),
            fontWeight: 'bold',
          }}
          name="arrow-left"
        />
      </TouchableOpacity>
    );
  };

  const toggleMute = async () => {
    if (isMuted) {
      // Unmute: restore to previous volume
      await TrackPlayer.setVolume(prevVolume);
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      // Mute: store current volume and set to 0
      setPrevVolume(volume); // Save current volume before muting
      await TrackPlayer.setVolume(0);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        rightPressActive={false}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        centerText="🎵 음악 "
        containerStyle={{ paddingHorizontal: 8 }}
        isRight={false}
      />
      <View style={styles.container}>
        <Text style={styles.title}>🎧 제목:</Text>
        <Text style={styles.nowPlaying}
              numberOfLines={1}
              ellipsizeMode="tail"
        >
           {displayTitle}
          {isLoading && ' (로딩 중...)'}
        </Text>

        <View style={styles.controlsContainer}>
          {/* Repeat Button */}
          <TouchableOpacity
            onPress={toggleRepeatMode}
            disabled={selectedTracks.length === 0}
            style={{
              backgroundColor: getRepeatButtonColor(),
              padding: 10,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 5,
            }}
          >
            <MaterialIcon
              name={getRepeatButtonIcon()}
              size={RFPercentage(2.5)}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkipPrevious}
            disabled={!currentTrack}
            style={{
              backgroundColor: "#6c757d",
              padding: RFPercentage(1),
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 5,
            }}
          >
            <Text style={{ fontSize: RFPercentage(2.5), color: 'white' }}>⬅️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayback}
            disabled={!currentTrack}
            style={{
              backgroundColor: isPlaying ? "#FF4500" : "#28a745",
              padding: RFPercentage(1),
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 5,
            }}
          >
            <Text style={{ fontSize: RFPercentage(2.5), color: 'white' }}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkipNext}
            disabled={!currentTrack}
            style={{
              backgroundColor: "#6c757d",
              padding: RFPercentage(1),
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 5,
            }}
          >
            <Text style={{ fontSize: RFPercentage(2.5), color: 'white' }}>➡️</Text>
          </TouchableOpacity>
        </View>

        {currentTrack && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={progress.duration || 0}
              value={progress.position}
              onSlidingComplete={async (value) => {
                await TrackPlayer.seekTo(value);
              }}
              minimumTrackTintColor="#1FB28A"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#1FB28A"
              disabled={!currentTrack || isLoading}
            />
            <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
          </View>
        )}

        <View style={styles.volumeContainer}>
          <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
            <MaterialIcon
              name={isMuted || volume === 0 ? 'volume-mute' : 'volume-high'}
              size={RFPercentage(5)}
              color={isMuted || volume === 0 ? 'red' : '#333'}
            />
          </TouchableOpacity>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            step={0.01}
            onValueChange={async (value) => {
              setVolume(value);
              await TrackPlayer.setVolume(value);
              if (value > 0) {
                setIsMuted(false); // Unmute if volume is increased
              }
            }}
            minimumTrackTintColor="#1FB28A"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#1FB28A"
          />
          <Text style={styles.volumeText}>{(volume * 100).toFixed(0)}%</Text>
        </View>

      </View>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 15,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  nowPlaying: {
    fontSize: RFPercentage(2.5),
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#34495e',
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontSize: RFPercentage(2),
    color: '#333',
  },
  slider: {
    height: 40,
    width: '70%',
    marginHorizontal: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: RFPercentage(1.8),
    minWidth: 40,
    backgroundColor: '#e0e0e0',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  repeatButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  volumeSlider: {
    flex: 1, // Take up remaining space
    height: 40,
  },
  muteButton: {
    padding: 10,
    marginRight: 10,
  },
  volumeText: {
    fontSize: RFPercentage(2),
    marginLeft: 10,
    color: '#333',
    minWidth: 40,
    textAlign: 'right',
  }
});

export default PlayerScreen;