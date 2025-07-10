/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList } from 'react-native'; // Import Modal and FlatList
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
  useProgress,
  RepeatMode
} from 'react-native-track-player';
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
import { baseURL } from '../../assets/common/BaseUrl';
import axios from 'axios';
import { useSleepTimer } from '../../context/store/SleepTimerContext';
import { height, width } from '../../styles/responsiveSize';

const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]; // Define available playback speeds

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  // Initial setup (default to empty arrays)
  const { selectedTracks = [], playlist = [] } = route.params || {};
  const {
    sleepTimerActive,
    setSleepTimerActive,
    initialSleepDelay,
  } = useSleepTimer();
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // State management
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [displayTitle, setDisplayTitle] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // New state for playback speed
  const [showSpeedModal, setShowSpeedModal] = useState<boolean>(false); // New state for modal visibility
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0); // New state for countdown

  // Ref management
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for countdown interval
  const sleepTimerCountRef = useRef<number>(0);
  const recognizedTextRef = useRef('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceResponseHandledRef = useRef(false);
  const afterSleepTimerRef = useRef<number>(0.1);

  // Player control hook
  const {
    repeatMode,
    volume,
    isMuted,
    setVolume,
    setRepeatMode,
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

  // Current track information
  const currentUri = selectedTracks[currentTrackIndex] || '';
  const currentTrack = playlist.find(item => item.uri === currentUri && item.type === 'file');
  const isPlaying = playbackState.state === State.Playing;
  // Check if the player is buffering or connecting to show loading overlay
  const isLoading = playbackState.state === State.Buffering || playbackState.state === State.Connecting;

  const awaitCancelSleepTimer = async() => {
    await cancelSleepTimer();
  };

  // Initial setup effect
  useEffect(() => {
    if (!route.params) {
      Alert.alert('에러', '재생할 트랙 정보가 없습니다.');
    }

    if(sleepTimerActive && playbackState.state === State.Playing){
      console.log('현재 수면 모드가 active 하고 현재 재생 중');
      awaitCancelSleepTimer();
    }
    else{
      console.log('현재 수면 모드가 inactive 하고 현재 재생 중 아님.... ');
    }

    console.log('PlayerScreen useEffect initialSleepDelay', initialSleepDelay);
    if (initialSleepDelay) {
      // 2025-06-27 22:35:58, initialSleepDelay value initialization issue resolved
      afterSleepTimerRef.current = initialSleepDelay;
    }

    return () => {
      console.log('PlayerScreen cleanup');
      if (sleepTimerCountdownIntervalRef.current) {
        clearInterval(sleepTimerCountdownIntervalRef.current);
      }
    };
  }, [route.params, initialSleepDelay]);

  // Handle voice interaction result
  const handleVoiceInteractionResult = async (continueMusic: boolean) => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (sleepTimerCountdownIntervalRef.current) {
      clearInterval(sleepTimerCountdownIntervalRef.current);
      setCountdownSeconds(0);
    }

    if (continueMusic) {
      sleepTimerCountRef.current += 1;
      if (sleepTimerCountRef.current < 5) {
        await TrackPlayer.play();
        console.log('handleVoiceInteractionResult afterSleepTimerRef.current = ', afterSleepTimerRef.current);
        console.log('handleVoiceInteractionResult initialSleepDelay = ', initialSleepDelay);

        const delayInSeconds = afterSleepTimerRef.current * 60;
        setCountdownSeconds(delayInSeconds);
        sleepTimerCountdownIntervalRef.current = setInterval(() => {
          setCountdownSeconds(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        sleepTimerRef.current = setTimeout(async () => {
          if (sleepTimerCountdownIntervalRef.current) {
            clearInterval(sleepTimerCountdownIntervalRef.current);
            setCountdownSeconds(0);
          }
          await handleVoiceInteraction();
        }, delayInSeconds * 1000); // Use delayInSeconds for setTimeout
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
            setRepeatMode(RepeatMode.Off); // 2025-06-26 13:41:44, repeat mode off
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
          setRepeatMode(RepeatMode.Off);  // 2025-06-26 13:41:44, repeat mode off
        }}]
      );
    }
  };

  // Start voice recognition
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
      console.error('Voice recognition error:', error);
      handleVoiceInteractionResult(false);
    }
  };

  // Track player setup
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

  // Voice recognition handling
  useVoiceRecognition({
    recognizedTextRef,
    voiceResponseHandledRef,
    handleVoiceInteractionResult,
    Voice,
  });

  // TTS setup
  useTtsSetup({
    recognizedTextRef,
    speechTimeoutRef,
    voiceResponseHandledRef,
    startVoiceRecognition,
    Tts,
    Alert,
  });

  // Function to record sleep mode time
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
      console.log(`sendSleepModeTime - ${endpoint} - server sent successfully`);
    } catch (error) {
      console.error('Sleep mode record error:', error);
    }
  };

  const sendSleepModeStartTime = (time: string) => sendSleepModeTime('start', time);
  const sendSleepModeEndTime = (time: string) => sendSleepModeTime('end', time);

  // Handle voice interaction
  const handleVoiceInteraction = async () => {
    await TrackPlayer.pause();
    recognizedTextRef.current = '';
    voiceResponseHandledRef.current = false;

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if (sleepTimerCountdownIntervalRef.current) {
      clearInterval(sleepTimerCountdownIntervalRef.current);
      setCountdownSeconds(0);
    }

    try {
      Tts.speak('잠 들었나요?');
    } catch (error) {
      console.error('TTS error:', error);
      handleVoiceInteractionResult(false);
    }
  };

  // Sleep timer management
  const cancelSleepTimer = async () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepTimerCountdownIntervalRef.current) {
      clearInterval(sleepTimerCountdownIntervalRef.current);
      setCountdownSeconds(0);
    }
    setSleepTimerActive(false);
    sleepTimerCountRef.current = 0;
    await ScreenBrightness.setBrightness(0.3);
    await TrackPlayer.stop();
    setRepeatMode(RepeatMode.Off); // 2025-06-26 13:41:44, repeat mode off
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

    await setRepeatMode(RepeatMode.Queue); // 2025-06-26 13:41:44, repeat mode added
    setSleepTimerActive(true);
    sleepTimerCountRef.current = 0;
    if (playbackState.state !== State.Playing) {
      await TrackPlayer.play();
    }

    sendSleepModeStartTime(new Date().toISOString());
    console.log('startSleepTimer afterSleepTimerRef.current = ', afterSleepTimerRef.current);
    console.log('startSleepTimer initialSleepDelay = ', initialSleepDelay);

    const delayInSeconds = afterSleepTimerRef.current * 60;
    setCountdownSeconds(delayInSeconds);

    // Clear any existing interval before setting a new one
    if (sleepTimerCountdownIntervalRef.current) {
      clearInterval(sleepTimerCountdownIntervalRef.current);
    }
    sleepTimerCountdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    // This setTimeout will now run immediately after all preceding awaits are resolved.
    sleepTimerRef.current = setTimeout(async () => {
      if (sleepTimerCountdownIntervalRef.current) {
        clearInterval(sleepTimerCountdownIntervalRef.current);
        setCountdownSeconds(0);
      }
      await handleVoiceInteraction();
    }, delayInSeconds * 1000);
  };

  // Function to handle playback speed change
  const handleSetPlaybackSpeed = async (speed: number) => {
    try {
      await TrackPlayer.setRate(speed);
      setPlaybackSpeed(speed);
      setShowSpeedModal(false); // Close modal after selection
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      Alert.alert('재생 속도 변경 실패', '재생 속도를 설정하는 데 문제가 발생했습니다.');
    }
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
      {/* <HeaderComponent
        rightPressActive={false}
        isLeftView={false}
        centerText="🎧"
        containerStyle={{  paddingHorizontal: 8 }}
        isRight={false}
        isRightView={false}
        rightCustomView={rightCustomComponent}
      /> */}
      <View style={styles.container}>
        <Text style={styles.title}> 제목:</Text>
        <Text style={styles.nowPlaying} numberOfLines={2} ellipsizeMode="tail">
          {displayTitle ? displayTitle : '선택된 곡 없음'}
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

        {/* Playback Speed Control */}
        <View style={styles.speedControlContainer}>
          <Text style={styles.currentSpeedText}>재생 속도: {playbackSpeed.toFixed(2)}x </Text>
          <TouchableOpacity
            onPress={() => setShowSpeedModal(true)}
            style={styles.speedButton}
          >
            <MaterialIcon name="speedometer" size={RFPercentage(3)} color={colors.white} />
            {/* <Text style={styles.speedButtonText}>속도 조절</Text> */}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={startSleepTimer}
          style={[
            styles.sleepModeButton,
            displayTitle ? (sleepTimerActive ? styles.sleepModeButtonActive : styles.sleepModeButtonInactive) : null,
          ]}
        >
          {displayTitle ? (
            <>
            <MaterialIcon name="sleep" size={RFPercentage(3)} color="white" />
            <Text style={styles.sleepModeButtonText}>
                        {sleepTimerActive ? '수면모드 활성화됨 (취소)' : '수면모드'}
            </Text>
            </>
          ) : null}
        </TouchableOpacity>

      </View>
      <View style= {{flex:1, backgroundColor: colors.lightGrey}}>
        {sleepTimerActive && countdownSeconds > 0 && (
           <View style = {styles.countdownContainer}>
              <Text style={styles.countdownText}>
                다음 확인까지:{' '}
              </Text>
              <Text style={[styles.countdownText, {width: width * 0.1}]}>
                {Math.floor(countdownSeconds / 60) > 0 && `${Math.floor(countdownSeconds / 60)} `}
              </Text>

              <Text style={styles.countdownText}>
                {Math.floor(countdownSeconds / 60) > 0 && '분'}
              </Text>

               <Text style={[styles.countdownText, {width: width * 0.1}]}>
                {`${(countdownSeconds % 60).toString().padStart(2, '0')}`}
              </Text>
              <Text style={styles.countdownText}>
                초
              </Text>
           </View>
          )}
      </View>

      {/* Playback Speed Selection Modal */}
      <Modal
        visible={showSpeedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpeedModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowSpeedModal(false)} // Close modal when pressing outside
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>재생 속도 선택</Text>
            <FlatList
              data={playbackSpeeds}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.speedOption,
                    item === playbackSpeed && styles.speedOptionSelected,
                  ]}
                  onPress={() => handleSetPlaybackSpeed(item)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      item === playbackSpeed && styles.speedOptionTextSelected,
                    ]}
                  >
                    {item.toFixed(2)}x
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height : height * 0.9,
    height: height * 0.7,
    flexDirection: 'column',
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.lightGrey,
    // borderColor: 'red',
    // borderWidth: 2,
  },

  title: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    // marginTop: RFPercentage(5),
    marginBottom: RFPercentage(1),
    textAlign: 'center',
    color: '#2c3e50',
  },
  nowPlaying: {
    fontSize: RFPercentage(2),
    marginBottom: RFPercentage(3),
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#34495e',
  },

  sleepModeButton: {
    flexDirection: 'row',
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: RFPercentage(5),
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RFPercentage(5), // 둥글게 만들기,
    alignSelf: 'center',
  },
  sleepModeButtonInactive: {
    backgroundColor: colors.blue,
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

  countdownContainer: {
    flexDirection: 'row',
    width: width * 0.8,
    marginLeft: RFPercentage(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    // borderColor: 'red',
    // borderWidth: 2,
  },
  countdownText: { // New style for countdown
    fontSize: RFPercentage(2),
    textAlign: 'center',
    marginTop: 10,
    color: '#6a0dad',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's above other content
  },
  loadingText: {
    marginTop: 10,
    color: colors.white,
    fontSize: RFPercentage(2.5),
  },
  // New styles for playback speed
  speedControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  currentSpeedText: {
    fontSize: RFPercentage(2),
    color: '#34495e',
    marginRight: 10,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  speedButtonText: {
    color: colors.white,
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.grey,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: RFPercentage(2.8),
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.lightGrey,
    width: '100%',
    alignItems: 'center',
  },
  speedOptionSelected: {
    backgroundColor: '#2ecc71', // Highlight selected speed
  },
  speedOptionText: {
    fontSize: RFPercentage(2.2),
    color: '#34495e',
  },
  speedOptionTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PlayerScreen;
