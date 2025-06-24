/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import { RFPercentage } from 'react-native-responsive-fontsize';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import Tts from 'react-native-tts';
import Voice from "@react-native-voice/voice";

import TrackPlayer, {
  usePlaybackState,
  State,
  useProgress
} from 'react-native-track-player';
import { width } from '../../styles/responsiveSize';
import ScreenBrightness from 'react-native-screen-brightness';
import { PlayerScreenProps } from '../model/types/TUserNavigator';
import VolumeControl from './components/VolumeControl';
import PlayerControls from './components/PlayerControls';
import TrackPlaybackSlider from './components/TrackPlaybackSlider';
import { useTrackPlayerSetup } from './hooks/useTrackPlayerSetup';
import { useTtsSetup } from './hooks/useTtsSetup';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { usePlayerControls } from './hooks/usePlayerControls';
import { getToken } from '../../utils/getSaveToken';
import { jwtDecode } from 'jwt-decode';
import { UserFormInput } from '../model/interface/IAuthInfo';
import { alertMsg } from '../../utils/alerts/alertMsg';
import { baseURL } from '../../assets/common/BaseUrl';
import axios from 'axios';
import { useSleepTimer } from '../../context/store/SleepTimerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// interface PlaylistItem {
//   id: string;
//   name: string;
//   title?: string;
//   artist?: string;
//   path: string;
//   type: 'file' | 'folder';
//   uri?: string;
//   duration?: number;
//   isSelected?: boolean;
//   isDirectoryOpen?: boolean;
//   children?: PlaylistItem[];
//   depth?: number;
// }

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  // 초기값 설정 (빈 배열로 기본값 처리)
  const { selectedTracks = [], playlist = [] } = route.params || {};
  const { initialSleepDelay } = useSleepTimer();
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // 상태 관리
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [displayTitle, setDisplayTitle] = useState('선택된 곡 없음');
  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false);
  const [afterSleepTimer, setAfterSleepTimer] = useState<number>(initialSleepDelay || 0.1);

  // ref 관리
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerCountRef = useRef<number>(0);
  const recognizedTextRef = useRef('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceResponseHandledRef = useRef(false);

  // 플레이어 컨트롤 훅
  const {
    repeatMode,
    volume,
    isMuted,
    setVolume,
    togglePlayback,
    handleSkipPrevious,
    handleSkipNext,
    toggleRepeatMode,
    getRepeatButtonIcon,
    getRepeatButtonColor,
    toggleMute,
  } = usePlayerControls({
    currentTrackIndex,
    selectedTracksLength: selectedTracks.length,
    setCurrentTrackIndex,
  });

  // 현재 트랙 정보
  const currentUri = selectedTracks[currentTrackIndex] || '';
  const currentTrack = playlist.find(item => item.uri === currentUri && item.type === 'file');
  const isPlaying = playbackState.state === State.Playing;
  const isLoading = playbackState.state === State.Buffering || playbackState.state === State.Connecting;

  // 초기 설정 효과
  useEffect(() => {
    if (!route.params) {
      Alert.alert('에러', '재생할 트랙 정보가 없습니다.');
    }

    console.log('PlayerScreen useEffect initialSleepDelay', initialSleepDelay);
    if (initialSleepDelay) {
      setAfterSleepTimer(initialSleepDelay);
    }

    return () => {
      console.log('PlayerScreen 정리');
    };
  }, [route.params, initialSleepDelay]);

  // 음성 상호작용 결과 처리
  const handleVoiceInteractionResult = async (continueMusic: boolean) => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (continueMusic) {
      sleepTimerCountRef.current += 1;
      if (sleepTimerCountRef.current < 5) {
        await TrackPlayer.play();
        sleepTimerRef.current = setTimeout(async () => {
          await handleVoiceInteraction();
        }, afterSleepTimer * 60 * 1000);
      } else {
        sendSleepModeEndTime(new Date().toISOString());
        await ScreenBrightness.setBrightness(0.3);
        await TrackPlayer.stop();
        setSleepTimerActive(false);
        sleepTimerCountRef.current = 0;
        Alert.alert(
          '수면모드 종료',
          '5회 연속 확인하여 수면모드를 종료합니다.',
          [{ text: '확인', onPress: async () => {
            console.log('5회 연속 확인 수면모드 중단');
          }}]
        );
      }
    } else {
      sendSleepModeEndTime(new Date().toISOString());
      await ScreenBrightness.setBrightness(0.3);
      await TrackPlayer.stop();
      setSleepTimerActive(false);
      sleepTimerCountRef.current = 0;
      Alert.alert(
        '수면모드',
        '음악이 중단되었습니다.',
        [{ text: '확인', onPress: async () => {
          console.log('음악이 중단되었습니다.');
        }}]
      );
    }
  };


  // 음성 인식 시작
  const startVoiceRecognition = async () => {
    try {
      await Voice.start('ko-KR');
      speechTimeoutRef.current = setTimeout(() => {
        if (!voiceResponseHandledRef.current) {
          Voice.stop().then(() => {
            handleVoiceInteractionResult(false);
          });
        }
      }, 7000);
    } catch (error) {
      console.error('음성 인식 오류:', error);
      handleVoiceInteractionResult(false);
    }
  };


  // 트랙 플레이어 설정
  useTrackPlayerSetup({
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
  });

  // 음성 인식 처리
  useVoiceRecognition({
    recognizedTextRef,
    voiceResponseHandledRef,
    handleVoiceInteractionResult,
    Voice,
  });

  // TTS 설정
  useTtsSetup({
    recognizedTextRef,
    speechTimeoutRef,
    voiceResponseHandledRef,
    startVoiceRecognition,
    Tts,
    Alert,
  });

  

  // 수면 모드 시간 기록 함수
  const sendSleepModeTime = async (endpoint: string, time: string) => {
    const token = await getToken();
    if (!token) return;

    const decoded: UserFormInput = jwtDecode(token);
    const userId = decoded.userId;

    try {
      await axios.post(`${baseURL}sleepRecord/${endpoint}`, {
        userId,
        [endpoint === 'start' ? 'startTime' : 'endTime']: time
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`sendSleepModeTime - ${endpoint} - 서버 송부 success`);
    } catch (error) {
      console.error('수면 모드 기록 오류:', error);
    }
  };

  const sendSleepModeStartTime = (time: string) => sendSleepModeTime('start', time);
  const sendSleepModeEndTime = (time: string) => sendSleepModeTime('end', time);

  // 음성 상호작용 처리
  const handleVoiceInteraction = async () => {
    await TrackPlayer.pause();
    recognizedTextRef.current = '';
    voiceResponseHandledRef.current = false;

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }

    try {
      await Tts.speak('잠 들었나요?');
    } catch (error) {
      console.error('TTS 오류:', error);
      handleVoiceInteractionResult(false);
    }
  };

  // 수면 타이머 관리
  const cancelSleepTimer = async () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerActive(false);
    sleepTimerCountRef.current = 0;
    await ScreenBrightness.setBrightness(0.3);
    await TrackPlayer.stop();
    sendSleepModeEndTime(new Date().toISOString());
  };

  const startSleepTimer = async () => {
    if (sleepTimerActive) {
      Alert.alert(
        '수면모드',
        '수면모드를 취소하시겠습니까?',
        [
          { text: '아니오', style: 'cancel' },
          { text: '예', onPress: cancelSleepTimer },
        ]
      );
      return;
    }

    setSleepTimerActive(true);
    sleepTimerCountRef.current = 0;
    if (playbackState.state !== State.Playing) {
      await TrackPlayer.play();
    }

    sendSleepModeStartTime(new Date().toISOString());
    console.log('startSleepTimer afterSleepTimer = ', afterSleepTimer);

    sleepTimerRef.current = setTimeout(async () => {
      await handleVoiceInteraction();
    }, afterSleepTimer * 60 * 1000);
  };

  const rightCustomComponent = () => (
    <TouchableOpacity onPress={() => console.log('타이머 설정')}>
      <Ionicons
        style={{
          height: RFPercentage(8),
          width: RFPercentage(10),
          marginTop: RFPercentage(3),
          marginRight: RFPercentage(-4),
          color: colors.black,
          fontSize: RFPercentage(5),
          fontWeight: 'bold',
        }}
        name="timer"
      />
    </TouchableOpacity>
  );

  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        rightPressActive={false}
        isLeftView={false}
        centerText="🎵 음악"
        containerStyle={{ paddingHorizontal: 8 }}
        isRight={false}
        isRightView={false}
        rightCustomView={rightCustomComponent}
      />
      <View style={styles.container}>
        <Text style={styles.title}>🎧 제목:</Text>
        <Text style={styles.nowPlaying} numberOfLines={1} ellipsizeMode="tail">
          {displayTitle}
          {isLoading && ' (로딩 중...)'}
        </Text>

        <PlayerControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTrack={currentTrack}
          togglePlayback={togglePlayback}
          handleSkipPrevious={handleSkipPrevious}
          handleSkipNext={handleSkipNext}
          toggleRepeatMode={toggleRepeatMode}
          getRepeatButtonIcon={getRepeatButtonIcon}
          getRepeatButtonColor={getRepeatButtonColor}
          selectedTracksLength={selectedTracks.length}
        />

        {currentTrack && (
          <TrackPlaybackSlider
            progress={progress}
            currentTrack={currentTrack}
            isLoading={isLoading}
          />
        )}

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          setVolume={setVolume}
          toggleMute={toggleMute}
        />

        <TouchableOpacity
          onPress={startSleepTimer}
          style={[
            styles.sleepModeButton,
            sleepTimerActive ? styles.sleepModeButtonActive : styles.sleepModeButtonInactive,
          ]}
        >
          <MaterialIcon name="sleep" size={RFPercentage(3)} color="white" />
          <Text style={styles.sleepModeButtonText}>
            {sleepTimerActive ? '수면모드 활성화됨 (취소)' : '수면모드'}
          </Text>
        </TouchableOpacity>
      </View>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.lightGrey,
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
  sleepModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  sleepModeButtonInactive: {
    backgroundColor: '#6a0dad',
  },
  sleepModeButtonActive: {
    backgroundColor: '#c0a0ff',
  },
  sleepModeButtonText: {
    color: 'white',
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default PlayerScreen;