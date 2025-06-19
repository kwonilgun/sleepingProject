// src/hooks/useSleepTimer.ts
import { useState, useEffect, useRef } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import Tts from 'react-native-tts';
import Voice from "@react-native-voice/voice";
import ScreenBrightness from 'react-native-screen-brightness';
import TrackPlayer, { State } from 'react-native-track-player';

interface UseSleepTimerProps {
  playbackState: { state: State; [key: string]: any }; // Adjust type as per TrackPlayer's usePlaybackState return
  isPlaying: boolean;
  togglePlayback: () => Promise<void>;
  navigation: any; // Or a more specific navigation type
}

export const useSleepTimer = (
  playbackState: UseSleepTimerProps['playbackState'],
  isPlaying: UseSleepTimerProps['isPlaying'],
  togglePlayback: UseSleepTimerProps['togglePlayback'],
  navigation: UseSleepTimerProps['navigation']
) => {
  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerCountRef = useRef<number>(0);

  const recognizedTextRef = useRef('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceResponseHandledRef = useRef(false);

  // TTS Initialization and Listeners
  useEffect(() => {
    const initTTS = async () => {
      try {
        await Tts.setDefaultLanguage('ko-KR');
      } catch (error) {
        console.error('TTS setup error:', error);
      }
    };
    initTTS();

    const ttsListeners = [
      Tts.addEventListener('tts-start', () => console.log('TTS start')),
      Tts.addEventListener('tts-progress', (event) => console.log("TTS progress", event)),
      Tts.addEventListener('tts-finish', () => {
        console.log("TTS finish");
        startVoiceRecognition(); // Start voice recognition after TTS finishes
      }),
      Tts.addEventListener('tts-cancel', () => console.log("TTS cancel")),
    ];

    return () => {
      ttsListeners.forEach(listener => listener.remove());
      // Tts.stop(); // Optional: Stop TTS on unmount
    };
  }, []);

  // Voice Recognition Listeners
  useEffect(() => {
    const onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0 && !voiceResponseHandledRef.current) {
        recognizedTextRef.current = e.value[0];
        console.log('Recognized speech:', recognizedTextRef.current);

        const lowercasedText = recognizedTextRef.current.toLowerCase();
        if (lowercasedText.includes('아니요') || lowercasedText.includes('아니') || lowercasedText.includes('no')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => handleVoiceInteractionResult(false)); // User is not asleep
        } else if (lowercasedText.includes('예') || lowercasedText.includes('네') || lowercasedText.includes('yes')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => handleVoiceInteractionResult(true)); // User is asleep
        }
      }
    };

    const onSpeechError = (e: any) => {
      console.error('Speech recognition error:', e);
      // If error occurs and no response has been handled, assume no response for timeout logic
      if (!voiceResponseHandledRef.current) {
        voiceResponseHandledRef.current = true; // Mark as handled to prevent further processing
        handleVoiceInteractionResult(false); // Treat as no response (user might be asleep)
      }
    };

    const onSpeechEnd = () => {
      console.log('<<<<<<<Speech recognition session ended>>>>>>>');
      if (!voiceResponseHandledRef.current) {
         voiceResponseHandledRef.current = true; // Mark as handled
         handleVoiceInteractionResult(false); // If speech ends without valid response, assume no response.
      }
    };


    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Clear sleep timer if playback stops naturally (not by timer)
  useEffect(() => {
    if (playbackState.state === State.Stopped || playbackState.state === State.Paused) {
      // Only clear if the timer is NOT the reason for stopping
      if (sleepTimerActive && sleepTimerRef.current) {
        // This check is a bit tricky, might need a flag from handleVoiceInteractionResult
        // For simplicity now, we assume if state changes to stopped/paused and timer is active,
        // it means the user manually stopped or track ended without timer intervention.
        // A more robust solution might pass a 'stoppedByTimer' flag.
        // For now, if user manually pauses/stops, we disable sleep timer.
        if (!voiceResponseHandledRef.current) { // If it wasn't due to voice interaction, clear it
            clearTimeout(sleepTimerRef.current);
            sleepTimerRef.current = null;
            setSleepTimerActive(false);
            sleepTimerCountRef.current = 0;
            console.log("Sleep timer cleared due to external playback stop/pause.");
        }
      } else if (!sleepTimerActive) {
        // If sleep timer is not active, reset count just in case
        sleepTimerCountRef.current = 0;
      }
    }
  }, [playbackState.state, sleepTimerActive]);


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
        console.warn('Microphone permission request error:', err);
        return false;
      }
    }
    return true; // iOS handles permission dialog automatically on first use
  };

  const startVoiceRecognition = async () => {
    try {
      await Voice.start('ko-KR');
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      // 7-second timeout for voice recognition
      speechTimeoutRef.current = setTimeout(() => {
        if (!voiceResponseHandledRef.current) {
          console.log('<<<<<<<Voice recognition timeout>>>>>>>');
          Voice.stop().then(() => {
            handleVoiceInteractionResult(false); // No response within timeout
          });
        }
      }, 7000);
    } catch (error) {
      console.error('Error starting voice interaction:', error);
      handleVoiceInteractionResult(false);
    }
  };

  const handleVoiceInteraction = async () => {
    await TrackPlayer.pause();
    try {
      // Reset voice recognition flags
      recognizedTextRef.current = '';
      voiceResponseHandledRef.current = false;
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }

      await Tts.speak('잠 들었나요?');
      // Voice recognition starts after TTS finishes (handled in tts-finish listener)
    } catch (error) {
      console.error('TTS error during voice interaction:', error);
      handleVoiceInteractionResult(false); // TTS error also leads to stopping music
    }
  };

  const handleVoiceInteractionResult = async (userRespondedYes: boolean) => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    voiceResponseHandledRef.current = true; // Ensure this is true when result is processed

    if (userRespondedYes) { // User said "Yes" (meaning they are NOT asleep)
      sleepTimerCountRef.current += 1;
      console.log(`Sleep mode repetition count: ${sleepTimerCountRef.current} / 3`);

      if (sleepTimerCountRef.current < 3) {
        console.log('Sleep mode', `Continuing music playback. (${sleepTimerCountRef.current} checks completed)`);
        if (playbackState.state !== State.Playing) { // Only play if not already playing
             await TrackPlayer.play();
        }

        // Set next timer
        sleepTimerRef.current = setTimeout(async () => {
          await handleVoiceInteraction();
        }, 0.1 * 60 * 1000); // Next check in 1 minute (0.1 for testing)
      } else {
        // User responded "Yes" 3 times in a row, assume they are not using sleep mode
        Alert.alert(
          '수면모드 종료',
          '3회 연속 잠들지 않았다고 응답하여 수면모드를 종료합니다. 음악이 중단됩니다.',
          [{
            text: '확인', onPress: async () => {
              await ScreenBrightness.setBrightness(0.1);
              await TrackPlayer.stop();
              setSleepTimerActive(false);
              sleepTimerCountRef.current = 0;
              // navigation.goBack(); // Or RNExitApp.exitApp();
            }
          }]
        );
        await ScreenBrightness.setBrightness(0.05);
        await TrackPlayer.stop();
        setSleepTimerActive(false);
        sleepTimerCountRef.current = 0;
      }
    } else { // User did NOT respond "Yes" (either said "No" or timed out / error)
      Alert.alert(
        '수면모드',
        '음악이 중단되었습니다.',
        [{
          text: '확인', onPress: async () => {
            await ScreenBrightness.setBrightness(0.1);
            // navigation.goBack(); // Or RNExitApp.exitApp();
          }
        }]
      );
      console.log('Sleep mode stopped, app might exit or music stops.');
      await ScreenBrightness.setBrightness(0.1);
      await TrackPlayer.stop();
      setSleepTimerActive(false);
      sleepTimerCountRef.current = 0;
    }
  };


  const startSleepTimer = async () => {
    if (sleepTimerActive) {
      Alert.alert('수면모드', '이미 수면모드가 활성화되어 있습니다.');
      return;
    }

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert('권한 필요', '수면모드를 사용하려면 마이크 권한이 필요합니다.');
      return;
    }

    setSleepTimerActive(true);
    sleepTimerCountRef.current = 0;

    if (playbackState.state === State.Stopped || playbackState.state === State.Paused) {
      await TrackPlayer.play();
    }
    sleepTimerRef.current = setTimeout(async () => {
      await handleVoiceInteraction();
    }, 0.1 * 60 * 1000); // 1 minute (0.1 for testing)

    Alert.alert(
      '수면모드 시작',
      '수면모드를 시작합니다. 1분 후에 잠들었는지 확인하는 음성 알림이 뜹니다. (총 3회 반복)',
      [
        {
          text: '확인',
          onPress: () => {}, // Just dismiss the alert
        },
      ]
    );
  };

 // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
        console.log('Sleep timer cleared on unmount.');
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
        console.log('Speech timeout cleared on unmount.');
      }
      Tts.stop(); // Stop any pending TTS
      console.log('TTS stopped on unmount.');
      Voice.destroy().then(Voice.removeAllListeners); // Stop Voice recognition
      console.log('Voice recognition destroyed on unmount.');
      ScreenBrightness.setBrightness(0.5); // Reset brightness if it was changed
    };
  }, []);

  return { sleepTimerActive, startSleepTimer };
};