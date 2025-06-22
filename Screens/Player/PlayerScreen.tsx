/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
// src/screens/PlayerScreen.tsx
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Text, View, StyleSheet, TouchableOpacity, Alert, Platform, PermissionsAndroid, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { baseURL } from '../../assets/common/BaseUrl';
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
  Event,
  usePlaybackState,
  useProgress,
  State,
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode,
} from 'react-native-track-player';
import { width } from '../../styles/responsiveSize';
import ScreenBrightness from 'react-native-screen-brightness';
import { PlayerScreenProps } from '../model/types/TUserNavigator';
import VolumeControl from './components/VolumeControl';
import PlayerControls from './components/PlayerControls';
import SleepTimerModal from './components/SleepTimerModal';
import TrackPlaybackSlider from './components/TrackPlaybackSlider';



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

// interface PlayerScreenProps {
//   route: { params: { selectedTracks: string[] | undefined; playlist: PlaylistItem[] | undefined } };
//   navigation: any;
// }

enum RepeatMode {
  Off,
  RepeatOne,
  RepeatAll,
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // route.params가 undefined일 경우, 빈 객체 {}를 기본값으로 사용
  const { selectedTracks = [], playlist = [] } = route.params || {};

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [volume, setVolume] = useState<number>(0.3);
  const [prevVolume, setPrevVolume] = useState<number>(1.0); // To store volume before muting
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [displayTitle, setDisplayTitle] = useState('선택된 곡 없음');

  // New state for sleep timer
  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null); // Use useRef to hold the timer ID
  const sleepTimerCountRef = useRef<number>(0); // 3회 반복을 위한 카운터

  const [afterSleepTimer, setAfterSleepTimer] = useState<number>(0.1);
  const [sleepDelay, setSleepDelay] = React.useState(0.1); // Or your initial default

  // New states for fixed sleep timer options
  const [showSleepTimerOptions, setShowSleepTimerOptions] = useState<boolean>(false);
  const [activeSleepTimerLabel, setActiveSleepTimerLabel] = useState<string | null>(null); // e.g., "5분 후 시작"

  // 음성 인식 결과 저장 및 처리
  const recognizedTextRef = useRef(''); // 현재 인식된 텍스트를 저장
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 음성 인식 타임아웃 ID 저장
  const voiceResponseHandledRef = useRef(false); // 음성 응답 처리 여부 플래그
  const afterSleepTimerRef = useRef<number>(0.1);

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



  // voice recognition
  // const { selectedTracks, playlist } = route.params;
  const currentUri = selectedTracks[currentTrackIndex];
  let currentTrack = playlist.find(item => item.uri === currentUri && item.type === 'file');

  // Inside PlayerScreen component
  useEffect(() => {
    const checkAndRequestPermission = async () => {
      // Only call if permission hasn't been granted yet
      if(Platform.OS === 'android'){
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if(!granted) {
          await requestMicrophonePermission(); // This function already handles Android.
        }
      }
      if (Platform.OS === 'ios' ) { // On iOS, just trying to start will prompt.
        console.log('ios platform Microphone permisson 필요없다...');
        // On Android, we explicitly request.
        // For iOS, it will effectively do nothing but return true if Info.plist is set up.
      }
      // Alternatively, for iOS, you might just try to 'start' Voice.
      // The first Voice.start() call will trigger the iOS permission dialog.
      // However, this might not be ideal if you don't want voice recognition active immediately.
    };

    // If you *really* want to force it at startup, even if not immediately needed
    // You might call a lightweight Voice function that triggers the permission, e.g., Voice.start()
    // and then immediately Voice.stop() if you don't need it active.
    // This is generally not recommended as it's a bad user experience.
    // Users prefer permissions to be requested when they are about to use the feature.
    checkAndRequestPermission();
  }, []);


  useEffect(() => {
  // TTS 초기화 및 이벤트 설정
  const initTTS = async () => {
    try {
      await Tts.setDefaultLanguage('ko-KR');
      // await Tts.setDefaultRate(0.5);
      // await Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.error('TTS 설정 오류:', error);
    }
  };

  initTTS();

  // Define your event handlers
  const onSpeechStart = () => console.log('TTS 시작');
  const onSpeechProgress = (event:any ) => console.log("progress", event);
  const onSpeechFinish = (event:any ) => {
    console.log('Tts.addEventListner finish', event);
    startVoiceRecognition();
  };
  const onSpeechCancel = (event:any) => console.log("cancel", event);

  // TTS 이벤트 리스너 등록
  Tts.addEventListener('tts-start', onSpeechStart);
  Tts.addEventListener('tts-progress', onSpeechProgress);
  Tts.addEventListener('tts-finish', onSpeechFinish);
  Tts.addEventListener('tts-cancel', onSpeechCancel);

  // ... 기존의 Voice 이벤트 리스너 설정 ...

  return () => {
    // TTS 리스너 제거
    Tts.removeEventListener('tts-start', onSpeechStart);
    Tts.removeEventListener('tts-progress', onSpeechProgress);
    Tts.removeEventListener('tts-finish', onSpeechFinish);
    Tts.removeEventListener('tts-cancel', onSpeechCancel);

    // Tts.stop(); // Uncomment if you want to stop TTS on unmount
    // ... 기존의 Voice 정리 코드 ...
  };
}, []);


  // useEffect 내에서 이벤트 리스너 설정 (한 번만)
  useEffect(() => {
    const onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0 && !voiceResponseHandledRef.current) {
        recognizedTextRef.current = e.value[0];
        console.log('인식된 음성:', recognizedTextRef.current);

        if (recognizedTextRef.current.includes('아니요') || recognizedTextRef.current.includes('아니')) {

          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(true);
          });
        } else if (recognizedTextRef.current.includes('예') || recognizedTextRef.current.includes('네')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(true);
          });
        }
        else if (recognizedTextRef.current.includes('예스') || recognizedTextRef.current.includes('노')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(true);
          });
        }
      }
    };

    const onSpeechError = (e: any) => {
      console.log('음성 인식 오류:', e);
      // if (!voiceResponseHandledRef.current) {
      //   voiceResponseHandledRef.current = true;
      //   handleVoiceInteractionResult(false);
      // }
    };

    const onSpeechEnd = () => {
      console.log('<<<<<<<음성 인식 세션 종료>>>>>>>');
      // if (!voiceResponseHandledRef.current) {
      //   voiceResponseHandledRef.current = true;
      //   handleVoiceInteractionResult(false);
      // }
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const listenerPlaybackQueueEnded = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async data => {
      console.log('listenerPlaybackQueueEnded data ', data);
      if (repeatMode === RepeatMode.Off) {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0);
        // Clear sleep timer if playback naturally ends
        if (sleepTimerRef.current) {
          clearTimeout(sleepTimerRef.current);
          sleepTimerRef.current = null;
          setSleepTimerActive(false);
          sleepTimerCountRef.current = 0; // Reset count

        }
      }
    });

    return () => {
      listenerPlaybackActiveTrackChanged.remove();
      listenerPlaybackQueueEnded.remove();
      if (sleepTimerRef.current) { // Clear timer on unmount
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [repeatMode, volume]);

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
          : repeatMode === RepeatMode.RepeatOne
            ? TrackPlayerRepeatMode.Track
            : TrackPlayerRepeatMode.Queue;
      await TrackPlayer.setRepeatMode(mode);
      console.log('TrackPlayer.setRepeatMode called with:', mode);
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
    // iOS의 경우 Info.plist에 NSMicrophoneUsageDescription이 설정되어 있으면
    // 앱이 마이크를 처음 사용할 때 자동으로 권한 팝업이 뜹니다.
    return true;
  };

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

 const handleVoiceInteraction = async () => {
  console.log('handleVoiceInteraction called.');
  await TrackPlayer.pause();
  // console.log('TrackPlayer paused in handleVoiceInteraction.');

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
        setRepeatMode(RepeatMode.Off); // Update React state

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
      setRepeatMode(RepeatMode.Off); // Update React state
      sleepTimerCountRef.current = 0;
    }
    

  };

// Function to cancel sleep timer
  const cancelSleepTimer = async () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerActive(false);
    setRepeatMode(RepeatMode.Off);
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
        // console.log('TrackPlayer play called in startSleepTimer');
      }

      // console.log('Calling setRepeatMode(RepeatMode.RepeatAll);');
      setRepeatMode(RepeatMode.RepeatAll); // Update React state

      // Introduce a small delay before setting the timer for voice interaction
      setTimeout(() => {
        sleepTimerRef.current = setTimeout(async () => {
          console.log('Sleep timer fired! Calling handleVoiceInteraction()...');
          await handleVoiceInteraction();
        }, afterSleepTimerRef.current * 60 * 1000); // 1 minute

        console.log('Sleep timer set, afterSleepTimer = ', afterSleepTimerRef.current);
      }, 500); // Wait 500ms for TrackPlayer to potentially settle
};

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
        // TrackPlayerRepeatMode.Queue is already handled by TrackPlayer
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


  const LeftCustomComponent = () => {
    const handleGoBack = async () => {
      navigation.goBack();
    };

    return (
      <TouchableOpacity onPress={handleGoBack}>
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

  const setInitialSleepDelay = async (minutes: number) =>{
    console.log('setInitialSleepDelay minutes : ', minutes);
    setAfterSleepTimer(minutes!);
    afterSleepTimerRef.current = minutes;
  };

  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        rightPressActive={false}
        isLeftView={false}
        leftCustomView={LeftCustomComponent}
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