/* eslint-disable react-hooks/rules-of-hooks */
/*
 * File: App.tsx
 * Project: root_project
 * File Created: Wednesday, 14th February 2024
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright : 루트원 AI
 *
 * App's main entry point for initialization, audio playback, and navigation setup.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import {
  ActivityIndicator,
  Alert,
  LogBox,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform, // Import TouchableOpacity for the stop button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Event, State, Capability } from 'react-native-track-player';

// Contexts & Redux
import { AuthProvider } from './context/store/Context.Manager';
import { LanguageProvider } from './context/store/LanguageContext';
import { SleepTimerProvider } from './context/store/SleepTimerContext';
import store from './Redux/Cart/Store/store';

// Navigation
import MainTab from './Navigator/MainTab';

// Constants
import strings from './constants/lang'; // Assuming this is your localization utility
const introAudio = require('./assets/audio/intro.mp3');

import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
} from 'react-native-permissions';
// import { useVoiceRecognition } from './Screens/Player/hooks/useVoiceRecognition';
import Voice from "@react-native-voice/voice";
<<<<<<< HEAD
import colors from './styles/colors';
=======
>>>>>>> eb8dac8321e18e39c757dadb59838a9c39b55013


// AsyncStorage Key
const HAS_PLAYED_INTRO_AUDIO_KEY = 'HAS_PLAYED_INTRO_AUDIO';
const HAS_GRANTED_MICROPHONE_PERMISSION_KEY = 'HAS_GRANTED_MICROPHONE_PERMISSION'; // New key for permission


/**
 * Configures TrackPlayer capabilities for background playback control.
 */
const setupTrackPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });
  } catch (error) {
    console.error('Failed to setup TrackPlayer:', error);
    Alert.alert('오디오 설정 오류', '오디오 플레이어 초기화에 실패했습니다.');
  }
};

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false); // New state for stop button visibility
 const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null); // State for microphone permission

 
  // Ref to store the promise's resolve function for external control
 const introAudioPromiseResolve = useRef<((value: boolean) => void) | null>(null);

//  const recognizedTextRef = useRef('');
//  const voiceResponseHandledRef = useRef(false);


//  const handleVoiceInteraction = async (continueMusic: boolean) => {
//   console.log('App.tsx handelVoiceInteraction continueMusic', continueMusic);
//  };

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
  // Check if permission was previously granted and persisted

        const persistedPermission = await AsyncStorage.getItem(HAS_GRANTED_MICROPHONE_PERMISSION_KEY);

        if (persistedPermission === 'true') {
            console.log('Microphone permission already granted and persisted.');
            setHasMicrophonePermission(true);
            return true;
        }

        try {
          if (Platform.OS === 'ios') {
            console.log('IOS request PERMISSIONS.IOS.MICROPHONE');
            const result = await request(PERMISSIONS.IOS.MICROPHONE);
            console.log('MicrophonePermisson result = ', result === RESULTS.GRANTED);
            if(result === RESULTS.GRANTED){
              await AsyncStorage.setItem(HAS_GRANTED_MICROPHONE_PERMISSION_KEY, 'true');
              setHasMicrophonePermission(true);
              return true;
            }
            else{
              console.log('Microphone 허용되지 않음.');
              Alert.alert('에러', '마이크 허용 안됨');
              return false;
            }
          } else if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
              {
                title: '마이크 권한 요청',
                message: '음성 인식 기능을 위해 마이크 접근 권한이 필요합니다.',
                buttonNeutral: '나중에',
                buttonNegative: '거부',
                buttonPositive: '허용',
              },
            );
            return result === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            return false;
          }
        } catch (error) {
          console.error('마이크 권한 요청 중 오류 발생:', error);
          return false;
        }
    }, []);

  /**
   * Sets the application language to Korean.
   */
  const setAppLanguage = useCallback(async () => {
    try {
      await AsyncStorage.setItem('language', 'kr');
      strings.setLanguage('kr'); // Assuming 'strings' is a global or context-based utility
    } catch (e) {
      console.error('Failed to set language:', e);
    }
  }, []);

  /**
   * Plays the intro audio if it hasn't been played before.
   * Sets listeners for playback completion and errors.
   * @returns {Promise<boolean>} A promise that resolves to true if intro played, false if skipped or stopped.
   */
  const playIntroAudio = useCallback(async () => {
    try {
      const hasPlayed = await AsyncStorage.getItem(HAS_PLAYED_INTRO_AUDIO_KEY);

      if (hasPlayed === 'true') {
        console.log('Intro audio already played. Skipping...');
        return false; // Indicate that intro was skipped
      }

      console.log('Playing intro audio...');
      setIsPlayingIntro(true);
      setShowStopButton(true); // Show stop button when intro starts playing

      // Reset any previous state and add the intro track
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: 'intro_audio',
        url: introAudio,
        title: '소개 오디오',
        artist: '앱 소개',
      });

      await TrackPlayer.play();

      return new Promise<boolean>((resolve, reject) => {
        introAudioPromiseResolve.current = resolve; // Store resolve function

        const playbackQueueEndedListener = TrackPlayer.addEventListener(
          Event.PlaybackQueueEnded,
          async ({ track }) => {
            console.log('TrackPlayer: Playback queue ended for track:', track);
            await AsyncStorage.setItem(HAS_PLAYED_INTRO_AUDIO_KEY, 'true');
            setIsPlayingIntro(false);
            setShowStopButton(false); // Hide stop button
            playbackQueueEndedListener.remove(); // Clean up listener
            playbackErrorListener.remove(); // Clean up error listener as well
            await TrackPlayer.reset(); // Clear queue after successful playback
            resolve(true); // Indicate successful playback
          },
        );

        const playbackErrorListener = TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
          console.error('TrackPlayer: Playback error', error);
          Alert.alert('오디오 재생 실패', '소개 오디오 재생 중 오류가 발생했습니다.');
          setIsPlayingIntro(false);
          setShowStopButton(false); // Hide stop button
          playbackQueueEndedListener.remove(); // Clean up listener
          playbackErrorListener.remove(); // Clean up error listener
          TrackPlayer.reset(); // Reset on error
          reject(new Error('Intro audio playback failed.')); // Indicate failure
        });
      });
    } catch (e: any) {
      console.error('Error during intro audio playback:', e);
      Alert.alert('오디오 재생 오류', `소개 오디오 재생 중 문제가 발생했습니다: ${e.message || '알 수 없는 오류'}`);
      setIsPlayingIntro(false);
      setShowStopButton(false); // Hide stop button
      await TrackPlayer.reset();
      return false; // Indicate failure
    }
  }, []);

  /**
   * Handles stopping the intro audio manually.
   */
  const handleStopIntroAudio = useCallback(async () => {
    console.log('Stopping intro audio manually...');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset(); // Clear the queue
      await AsyncStorage.setItem(HAS_PLAYED_INTRO_AUDIO_KEY, 'true'); // Mark as played
      setIsPlayingIntro(false);
      setShowStopButton(false); // Hide the button
      if (introAudioPromiseResolve.current) {
        introAudioPromiseResolve.current(false); // Resolve the promise, indicating it was stopped manually
        introAudioPromiseResolve.current = null; // Clear the ref
      }
    } catch (error) {
      console.error('Error stopping intro audio:', error);
      Alert.alert('오류', '오디오 중지 중 문제가 발생했습니다.');
    }
  }, []);

  /**
   * Initializes the app: sets language, sets up TrackPlayer, and handles intro audio.
   */
  useEffect(() => {
    // Suppress specific LogBox warnings
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state',
    ]);

    // Conditional logging for development vs. production
    if (!__DEV__) {
      console.log('This is in production mode. Disabling console.log.');
      console.log = () => {};
    } else {
      console.log('This is in debug mode. Console.log is active.');
      // 2025-06-27 15:50:42, Intro audio를 테스트하기 위해서 추가
      AsyncStorage.setItem(HAS_PLAYED_INTRO_AUDIO_KEY, 'false');
      AsyncStorage.setItem(HAS_GRANTED_MICROPHONE_PERMISSION_KEY, 'false'); // Reset permission for testing
    }

    const initializeApp = async () => {
      console.log('Initializing app...');
      await setAppLanguage(); // Set app language first

      const granted = await requestMicrophonePermission();
      if (!granted) {
          console.warn('Microphone permission not granted. Some features may not work.');
          // You might want to halt app initialization or show a persistent warning here
          // For now, we proceed but log the warning.
      }
      else{
         console.log('마이크 허용 됨!!!!!!');
        //  useVoiceRecognition(
        //   recognizedTextRef,
        //   voiceResponseHandledRef,
        //   handleVoiceInteraction,
        //   Voice,
        //  );
        //  await Voice.start('ko-KR');
        //  Voice.stop().then(() =>{
        //   console.log('Voice stop .....');
        //  });
      }


      await setupTrackPlayer(); // Setup TrackPlayer capabilities

      // Attempt to play intro audio. Wait for it to complete if it plays.
      try {
        const playedIntro = await playIntroAudio();
        if (playedIntro) {
          console.log('Intro audio played successfully.');
        } else {
          console.log('Intro audio skipped or already played/stopped.');
        }
      } catch (error) {
        console.warn('Intro audio handling completed with errors, but app proceeds.');
      } finally {
        setIsAppReady(true); // Mark app as ready regardless of audio outcome
        setShowStopButton(false); // Ensure stop button is hidden once app is ready
      }
    };

    initializeApp();

    // Cleanup function: This runs when the component unmounts
    return () => {
      console.log('App component unmounting. Resetting TrackPlayer.');
      TrackPlayer.reset(); // Ensure TrackPlayer resources are released
    };
  }, [setAppLanguage, playIntroAudio]); // Dependencies to ensure useEffect re-runs if these change (though they are useCallback-ed)

  // Show loading indicator until the app is ready
  if (!isAppReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          {isPlayingIntro ? '소개 오디오 재생 중...' : '앱 초기화 중...'}
        </Text>
        {isPlayingIntro && showStopButton && ( // Conditionally render the stop button
          <TouchableOpacity style={styles.stopButton} onPress={handleStopIntroAudio}>
            <Text style={styles.stopButtonText}>재생 중단</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Once the app is ready, render the main application components
  return (
    <AuthProvider>
      <LanguageProvider>
        <Provider store={store}>
          <SleepTimerProvider>
            <NavigationContainer >
              <MainTab initialUrl='hello' />
            </NavigationContainer>
          </SleepTimerProvider>
        </Provider>
      </LanguageProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  stopButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;