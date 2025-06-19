// src/components/SleepModeHandler.tsx
import React, { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, Text, Alert, Platform, PermissionsAndroid, StyleSheet } from 'react-native';
import Tts from 'react-native-tts';
import Voice from '@react-native-voice/voice';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import TrackPlayer, { State } from 'react-native-track-player';
import ScreenBrightness from 'react-native-screen-brightness';
import { useNavigation } from '@react-navigation/native'; // If you need navigation within this component

interface SleepModeHandlerProps {
  onSleepModeDeactivated: () => void; // Callback when sleep mode deactivates
  playbackState: State;
}

const SleepModeHandler: React.FC<SleepModeHandlerProps> = ({ onSleepModeDeactivated, playbackState }) => {
//   const navigation = useNavigation();

  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerCountRef = useRef<number>(0);

  const recognizedTextRef = useRef('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceResponseHandledRef = useRef(false);

  useEffect(() => {
    // TTS 초기화 및 이벤트 설정
    const initTTS = async () => {
      try {
        await Tts.setDefaultLanguage('ko-KR');
      } catch (error) {
        console.error('TTS 설정 오류:', error);
      }
    };

    initTTS();

    const ttsListeners = [
      Tts.addEventListener('tts-start', () => console.log('TTS 시작')),
      Tts.addEventListener('tts-progress', (event) => console.log('progress', event)),
      Tts.addEventListener('tts-finish', (event) => {
        console.log('TTS finish', event);
        startVoiceRecognition();
      }),
      Tts.addEventListener('tts-cancel', (event) => console.log('cancel', event)),
    ];

    const onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0 && !voiceResponseHandledRef.current) {
        recognizedTextRef.current = e.value[0];
        console.log('인식된 음성:', recognizedTextRef.current);

        if (recognizedTextRef.current.includes('아니요') || recognizedTextRef.current.includes('아니') || recognizedTextRef.current.includes('노')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(false); // User is not asleep
          });
        } else if (recognizedTextRef.current.includes('예') || recognizedTextRef.current.includes('네') || recognizedTextRef.current.includes('예스')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(true); // User is awake
          });
        }
      }
    };

    const onSpeechError = (e: any) => {
      console.error('음성 인식 오류:', e);
      // It's crucial to handle errors, especially if recognition fails due to no speech or other issues.
      // If an error occurs and the response hasn't been handled, treat it as "no response" (user asleep).
      if (!voiceResponseHandledRef.current) {
        voiceResponseHandledRef.current = true;
        Voice.stop().then(() => {
          handleVoiceInteractionResult(false);
        });
      }
    };

    const onSpeechEnd = () => {
      console.log('<<<<<<<음성 인식 세션 종료>>>>>>>');
      // If speech ends but no valid response was handled, it means the user might have gone to sleep
      if (!voiceResponseHandledRef.current) {
        voiceResponseHandledRef.current = true;
        Voice.stop().then(() => {
          handleVoiceInteractionResult(false);
        });
      }
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      ttsListeners.forEach(listener => listener.remove());
      Voice.destroy().then(Voice.removeAllListeners);
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array ensures these effects run only once on mount

  useEffect(() => {
    // If playback stops for any reason other than the sleep timer, clear the sleep timer
    if ((playbackState.state === State.Stopped || playbackState.state === State.Paused) && sleepTimerActive) {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
        setSleepTimerActive(false);
        sleepTimerCountRef.current = 0; // Reset count when playback stops/pauses
        Alert.alert('수면모드', '음악 재생이 중단되어 수면모드가 해제되었습니다.');
        onSleepModeDeactivated();
      }
    }
  }, [playbackState, sleepTimerActive, onSleepModeDeactivated]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '마이크 권한 요청',
            message: '수면모드 기능을 사용하려면 마이크 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('마이크 권한 요청 오류:', err);
        return false;
      }
    }
    return true; // iOS handles this automatically on first use via Info.plist
  };

  const startVoiceRecognition = async () => {
    try {
      await Voice.start('ko-KR');

      speechTimeoutRef.current = setTimeout(() => {
        if (!voiceResponseHandledRef.current) {
          console.log('<<<<<<<음성 인식 타임아웃>>>>>>>');
          Voice.stop().then(() => {
            handleVoiceInteractionResult(false); // No response after timeout, assume asleep
          });
        }
      }, 7000); // 7 seconds timeout
    } catch (error) {
      console.error('음성 인식 시작 오류:', error);
      handleVoiceInteractionResult(false); // If voice start fails, assume asleep
    }
  };

  const handleVoiceInteraction = async () => {
    await TrackPlayer.pause();

    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('권한 필요', '마이크 권한이 없어 수면모드를 시작할 수 없습니다.');
        handleVoiceInteractionResult(false); // Treat as no response if permission denied
        return;
      }

      recognizedTextRef.current = '';
      voiceResponseHandledRef.current = false;
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }

      await Tts.speak('잠 들었나요?');
      // Voice recognition will start in the tts-finish event listener
    } catch (error) {
      console.error('TTS 또는 음성 인식 시작 오류:', error);
      handleVoiceInteractionResult(false); // TTS error, assume asleep
    }
  };

  const handleVoiceInteractionResult = async (continueMusic: boolean) => {
    console.log('handleVoiceInteractionResult - continueMusic:', continueMusic);
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (continueMusic) {
      // User is awake, continue music and potentially set next timer
      sleepTimerCountRef.current += 1;
      console.log(`수면모드 반복 횟수: ${sleepTimerCountRef.current} / 3`);

      if (sleepTimerCountRef.current < 3) {
        Alert.alert('수면모드', `음악을 계속 재생합니다. (${sleepTimerCountRef.current}회 확인 완료)`);
        await TrackPlayer.play();
        sleepTimerRef.current = setTimeout(async () => {
          await handleVoiceInteraction();
        }, 0.1 * 60 * 1000); // 1 minute later for next check
      } else {
        // 3 successful "yes" responses, deactivate sleep mode
        Alert.alert(
          '수면모드 종료',
          '3회 연속 잠들지 않았다고 응답하여 수면모드를 종료합니다. 음악이 중단됩니다.',
          [{ text: '확인', onPress: async () => {
            await ScreenBrightness.setBrightness(0.1);
            await TrackPlayer.stop();
            setSleepTimerActive(false);
            sleepTimerCountRef.current = 0;
            onSleepModeDeactivated(); // Notify parent
          } }]
        );
        await ScreenBrightness.setBrightness(0.05);
        await TrackPlayer.stop();
        setSleepTimerActive(false);
        sleepTimerCountRef.current = 0;
        onSleepModeDeactivated(); // Notify parent
      }
    } else {
      // User is asleep or didn't respond, stop music and deactivate sleep mode
      Alert.alert(
        '수면모드 종료',
        '잠드신 것으로 판단되어 음악 재생을 중단합니다. 화면 밝기가 최소화됩니다.',
        [{ text: '확인', onPress: async () => {
          await ScreenBrightness.setBrightness(0.1);
          await TrackPlayer.stop();
          setSleepTimerActive(false);
          sleepTimerCountRef.current = 0;
          onSleepModeDeactivated(); // Notify parent
        } }]
      );
      await ScreenBrightness.setBrightness(0.05);
      await TrackPlayer.stop();
      setSleepTimerActive(false);
      sleepTimerCountRef.current = 0;
      onSleepModeDeactivated(); // Notify parent
    }
  };

  const startSleepTimer = async () => {
    if (sleepTimerActive) {
      Alert.alert('수면모드', '이미 수면모드가 활성화되어 있습니다.');
      return;
    }

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert('권한 필요', '수면모드 기능을 사용하려면 마이크 접근 권한이 필요합니다.');
      return;
    }

    Alert.alert(
      '수면모드 시작',
      '수면모드를 시작합니다. 잠시 후 잠들었는지 확인하는 음성 알림이 뜹니다. (총 3회 반복)',
      [
        {
          text: '취소',
          onPress: () => {
            if (sleepTimerRef.current) {
              clearTimeout(sleepTimerRef.current);
              sleepTimerRef.current = null;
              setSleepTimerActive(false);
              sleepTimerCountRef.current = 0;
              Alert.alert('수면모드', '수면모드가 취소되었습니다.');
            }
          },
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            setSleepTimerActive(true);
            sleepTimerCountRef.current = 0;
            if (playbackState.state === State.Stopped || playbackState.state === State.Paused) {
                await TrackPlayer.play();
            }
            sleepTimerRef.current = setTimeout(async () => {
              await handleVoiceInteraction();
            }, 0.1 * 60 * 1000); // 1 minute later
          },
        },
      ]
    );
  };

  return (
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
        {sleepTimerActive ? '수면모드 활성화됨' : '수면모드'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default SleepModeHandler;