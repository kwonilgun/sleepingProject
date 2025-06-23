/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
// src/screens/PlayerScreen.tsx
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import { RFPercentage } from 'react-native-responsive-fontsize';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import Tts from 'react-native-tts'; // Text-to-Speech 라이브러리
import Voice from "@react-native-voice/voice";

import TrackPlayer, {
  usePlaybackState,
  State
} from 'react-native-track-player';
import { width } from '../../styles/responsiveSize';
import ScreenBrightness from 'react-native-screen-brightness';
import { PlayerScreenProps } from '../model/types/TUserNavigator';
import VolumeControl from './components/VolumeControl';
import PlayerControls from './components/PlayerControls';
import SleepTimerModal from './components/SleepTimerModal';
import TrackPlaybackSlider from './components/TrackPlaybackSlider';
import { useTrackPlayerSetup } from './hooks/useTrackPlayerSetup';
import { useTtsSetup} from './hooks/useTtsSetup';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { usePlayerControls } from './hooks/usePlayerControls'; // Import the new hook

export interface PlaylistItem {
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


const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const playbackState = usePlaybackState();
  // route.params가 undefined일 경우, 빈 객체 {}를 기본값으로 사용
  const { selectedTracks = [], playlist = [] } = route.params || {};

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [displayTitle, setDisplayTitle] = useState('선택된 곡 없음');

  // New state for sleep timer
  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null); // Use useRef to hold the timer ID
  const sleepTimerCountRef = useRef<number>(0); // 3회 반복을 위한 카운터

  const [afterSleepTimer, setAfterSleepTimer] = useState<number>(0.1);
  // const [sleepDelay, setSleepDelay] = React.useState(0.1); // Or your initial default

  // New states for fixed sleep timer options
  const [showSleepTimerOptions, setShowSleepTimerOptions] = useState<boolean>(false);
  // const [activeSleepTimerLabel, setActiveSleepTimerLabel] = useState<string | null>(null); // e.g., "5분 후 시작"

  // 음성 인식 결과 저장 및 처리
  const recognizedTextRef = useRef(''); // 현재 인식된 텍스트를 저장
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 음성 인식 타임아웃 ID 저장
  const voiceResponseHandledRef = useRef(false); // 음성 응답 처리 여부 플래그
  const afterSleepTimerRef = useRef<number>(0.1);

  // Use the new usePlayerControls hook
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
    // RepeatMode: PlayerControlsRepeatMode, // Alias to avoid naming conflict
  } = usePlayerControls({
    currentTrackIndex,
    selectedTracksLength: selectedTracks.length,
    setCurrentTrackIndex,
  });


  const currentUri = selectedTracks[currentTrackIndex];
  let currentTrack = playlist.find(item => item.uri === currentUri && item.type === 'file');
  const isPlaying = playbackState.state === State.Playing;
  const isLoading = playbackState.state === State.Buffering || playbackState.state === State.Connecting;

  // --- 추가된 로직 시작 ---
  useEffect(() => {
    // route.params가 없는 경우를 대비한 안전 장치
    if (!route.params) {
      Alert.alert('오류', '재생할 트랙 정보가 없습니다.', [{ text: '확인', onPress: () => navigation.goBack() }]);
      return;
    }

    const { selectedTracks, playlist } = route.params;

    if (!selectedTracks || selectedTracks.length === 0) {
      Alert.alert(
        '오류',
        '재생할 곡이 선택되지 않았습니다. 이전 화면으로 돌아갑니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (!playlist || playlist.length === 0) {
      Alert.alert(
        '오류',
        '플레이리스트 정보를 불러올 수 없습니다. 이전 화면으로 돌아갑니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
      return;
    }
  }, [route.params, navigation]); // route.params와 navigation이 변경될 때마다 이 효과를 다시 실행

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
      // RepeatMode, // Now using PlayerControlsRepeatMode if needed
    }
  );

  // --- 음성 상호작용 결과에 따른 처리 함수 ---
  const handleVoiceInteractionResult = async (continueMusic: any) => {
    console.log('continueMusic = ', continueMusic);
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (continueMusic) {
      // await TrackPlayer.play(); // 음악 재생 재개
      // Alert.alert('수면모드', '음악을 계속 재생합니다.');
      sleepTimerCountRef.current += 1;
      console.log(`수면모드 반복 횟수: ${sleepTimerCountRef.current} / 5`);

      if (sleepTimerCountRef.current < 5) {
        console.log('수면모드', `음악을 계속 재생합니다. (${sleepTimerCountRef.current}회 확인 완료)`);
        await TrackPlayer.play();

        console.log('handleVoiceInteractionResult. afterSleepTimerRef.current', afterSleepTimerRef.current);

        // 다음 타이머 설정
        sleepTimerRef.current = setTimeout(async () => {
          await handleVoiceInteraction();
        }, afterSleepTimerRef.current * 60 * 1000); //  afterSleepTimer 분 후
      } else {
        // 3회 모두 "예" 응답 시 음악 중단 및 앱 종료
        Alert.alert(
          '수면모드 종료',
          '5회 연속 잠들지 않았다고 응답하여 수면모드를 종료합니다. 음악이 중단됩니다.',
          [{ text: '확인', onPress: async () => {

             await ScreenBrightness.setBrightness(0.3); // 밝기 최소로
            // await TrackPlayer.stop();
            // setSleepTimerActive(false);
            // sleepTimerCountRef.current = 0;
            // navigation.goBack(); // 또는 RNExitApp.exitApp();
          } }]
        );
         await ScreenBrightness.setBrightness(0.3); // 밝기 최소로
         await TrackPlayer.stop();
        setSleepTimerActive(false);
        // setRepeatMode(RepeatMode.Off); // Use PlayerControlsRepeatMode
        // Since repeatMode is now managed by usePlayerControls, you might need a setter for it if you want to change it from here.
        // For now, if sleep mode cancels, it's a good idea to reset the repeat mode.
        // You'll need to add a `setRepeatMode` to the return of usePlayerControls if you want to set it externally.
        // For demonstration, let's assume `usePlayerControls` exposes `setRepeatMode`.
        // To fix this, you'll need to modify `usePlayerControls.ts` to expose `setRepeatMode`.
        // For now, I'll comment this out and suggest adding it.
        // setRepeatMode(PlayerControlsRepeatMode.Off);

        sleepTimerCountRef.current = 0;
      }
    } else {
      Alert.alert(
        '수면모드',
        '음악이 중단되었습니다.',
        [{ text: '확인', onPress: async () => {

          await ScreenBrightness.setBrightness(0.3); // 밝기 최소로

          // await TrackPlayer.stop();
          // setSleepTimerActive(false);
          // sleepTimerCountRef.current = 0;
          // navigation.goBack(); // 또는 RNExitApp.exitApp();
        } }]
      );

      console.log('수면모드 중단되고, 앱이 종료된다. ');
      await ScreenBrightness.setBrightness(0.3); // 밝기 최소로

      await TrackPlayer.stop();
      setSleepTimerActive(false);
      // setRepeatMode(RepeatMode.Off); // Use PlayerControlsRepeatMode
      // setRepeatMode(PlayerControlsRepeatMode.Off); // Needs setRepeatMode from usePlayerControls
      sleepTimerCountRef.current = 0;
    }
  };

  useVoiceRecognition({
      recognizedTextRef,
      voiceResponseHandledRef,
      handleVoiceInteractionResult,
      Voice,
  });

  const startVoiceRecognition = async () => {

    try {
       await Voice.start('ko-KR');

        // 7초 타임아웃 설정
        speechTimeoutRef.current = setTimeout(() => {
          if (!voiceResponseHandledRef.current) {
            console.log('<<<<<<<음성 인식 타임아웃>>>>>>>');
            Voice.stop().then(() => {
              handleVoiceInteractionResult(false);
            });
          }
        }, 7000);
    } catch (error) {
       console.error('음성 상호작용 시작 오류:', error);
      handleVoiceInteractionResult(false);
    }
  };

  // Custom hook for Voice Recognition logic
  useTtsSetup({
      recognizedTextRef,
      speechTimeoutRef,
      voiceResponseHandledRef,
      startVoiceRecognition,
      // handleVoiceInteractionResult,
      Tts,
      // Voice,
      Alert,
    }
  );

  const handleVoiceInteraction = async () => {
    console.log('handleVoiceInteraction called.');
    await TrackPlayer.pause();
    try {
      recognizedTextRef.current = '';
      voiceResponseHandledRef.current = false;

      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }

      console.log('Calling Tts.speak("잠 들었나요?")...');
      // Ensure you have a way to await TTS completion or check its status
      await new Promise<void>(() => {
          // const finishListener = Tts.addEventListener('tts-finish', (event) => {
          //     console.log("TTS finish event caught in handleVoiceInteraction promise:", event);
          //     finishListener.remove(); // Remove listener after it fires once
          //     resolve();
          // });
          Tts.speak('잠 들었나요?');
      });
      console.log('Tts.speak("잠 들었나요?") completed.');
      // TTS 종료 후 음성 인식 시작 (This is handled by the tts-finish listener in useEffect)

    } catch (error) {
      console.error('TTS error in handleVoiceInteraction:', error);
      handleVoiceInteractionResult(false);
    }
  };

// Function to cancel sleep timer
  const cancelSleepTimer = async () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerActive(false);
    // setRepeatMode(RepeatMode.Off); // Needs setRepeatMode from usePlayerControls
    sleepTimerCountRef.current = 0;
    await ScreenBrightness.setBrightness(0.3); // Reset brightness if needed
    await TrackPlayer.stop(); // Stop music immediately
    Alert.alert('수면모드', '수면모드가 취소되었습니다.');
  };

  const startSleepTimer = async () => {
      console.log('startSleepTimer called');
      if (sleepTimerActive) {
      // If sleep timer is already active, cancel it
      Alert.alert(
          '수면모드',
          '수면모드가 현재 활성화되어 있습니다. 취소하시겠습니까?',
          [
            { text: '아니오', style: 'cancel' },
            { text: '예', onPress: cancelSleepTimer },
          ]
        );
        return;
      }


      setSleepTimerActive(true);
      sleepTimerCountRef.current = 0;
      if (playbackState.state === State.Stopped || playbackState.state === State.Paused) {
        TrackPlayer.play();
      }



      // Introduce a small delay before setting the timer for voice interaction
      setTimeout(() => {
        sleepTimerRef.current = setTimeout(async () => {
          console.log('Sleep timer fired! Calling handleVoiceInteraction()...');
          await handleVoiceInteraction();
        }, afterSleepTimerRef.current * 60 * 1000); // 1 minute

        console.log('Sleep timer set, afterSleepTimer = ', afterSleepTimerRef.current);
      }, 500); // Wait 500ms for TrackPlayer to potentially settle
};

  const setInitialSleepDelay = async (minutes: number) =>{
    console.log('setInitialSleepDelay minutes : ', minutes);
    setAfterSleepTimer(minutes!);
    afterSleepTimerRef.current = minutes;
  };

  const rightCustomComponent = () => {
    const selectCheckTime = async () => {
      // navigation.goBack();
      console.log('right click');
      setShowSleepTimerOptions(true); // Show the sleep timer options modal

    };

    return (
      <TouchableOpacity onPress={selectCheckTime}>
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
  };

  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        rightPressActive={false}
        isLeftView={false}
        // leftCustomView={LeftCustomComponent}
        centerText="🎵 음악 "
        containerStyle={{ paddingHorizontal: 8 }}
        isRight={false}
        isRightView={true}
        rightCustomView={rightCustomComponent}
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
              // progress={progress} // No longer directly used here, usePlayerControls handles it internally for skip.
              // If TrackPlaybackSlider needs progress, you'll need to pass it from usePlayerControls or keep useProgress here.
              // For now, let's keep useProgress in PlayerScreen as TrackPlaybackSlider visually depends on it.
              // So, uncomment `const progress = useProgress();` in PlayerScreen.tsx and pass it down.
              progress={require('react-native-track-player').useProgress()} // Re-add useProgress for UI
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

          {/* Sleep Mode Button */}
          <TouchableOpacity
            onPress={startSleepTimer}
            style={[
              styles.sleepModeButton,
              sleepTimerActive ? styles.sleepModeButtonActive : styles.sleepModeButtonInactive,
            ]}
          >
            <MaterialIcon
              name="sleep"
              size={RFPercentage(3)}
              color="white"
            />
            <Text style={styles.sleepModeButtonText}>
              {sleepTimerActive ? '수면모드 활성화됨 (취소)' : '수면모드'}
            </Text>
          </TouchableOpacity>

          {/* Sleep Timer Options Modal */}
          <SleepTimerModal
            isVisible={showSleepTimerOptions}
            onClose={() => setShowSleepTimerOptions(false)}
            setInitialSleepDelay={setInitialSleepDelay}
            currentSelectedTime={afterSleepTimerRef.current}
          />
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
    borderRadius: 8,
    marginVertical: 15,
  },
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
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: RFPercentage(1.8),
    minWidth: 40,
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
    flex: 1,
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
  },
  // New styles for Sleep Mode button
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
    backgroundColor: '#6a0dad', // Darker purple when inactive
  },
  sleepModeButtonActive: {
    backgroundColor: '#c0a0ff', // Lighter purple when active
  },
  sleepModeButtonText: {
    color: 'white',
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
    marginLeft: 10,
  },

  activeTimerLabel: {
    marginTop: 15,
    fontSize: RFPercentage(1.8),
    color: '#6a0dad',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Styles for Sleep Timer Options Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sleepTimerOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sleepTimerOptionsTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sleepTimerOptionButton: {
    backgroundColor: '#4CAF50', // Green
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  sleepTimerOptionButtonActive: {
    backgroundColor: '#FFA500', // Orange when active
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  sleepTimerOptionButtonText: {
    color: 'white',
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
  },
  sleepTimerOptionButtonCancel: {
    backgroundColor: '#dc3545', // Red for cancel
    marginTop: 20,
  },
  sleepTimerOptionButtonClose: {
    backgroundColor: '#6c757d', // Grey for close
  },
  checkmarkIcon: {
    position: 'absolute', // Position the checkmark
    fontSize: RFPercentage(3),
    right: 15, // Adjust as needed
    top: 10,
  },
});


export default PlayerScreen;