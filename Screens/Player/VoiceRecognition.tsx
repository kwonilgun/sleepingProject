import React, { useRef, useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import Tts from 'react-native-tts'; // Text-to-Speech 라이브러리
import Voice from '@react-native-voice/voice'; // 음성 인식 라이브러리

// 이 코드는 React Native 컴포넌트 내부에 있어야 합니다.
// 'navigation'은 react-navigation 라이브러리의 useNavigation 훅을 통해 얻거나
// 컴포넌트의 props로 전달받아야 합니다.
// 예시: const navigation = useNavigation();

export default function SleepTimerFeature({ navigation }) {
  const sleepTimerRef = useRef(null); // 수면 타이머의 ID를 저장하는 ref
  const [sleepTimerActive, setSleepTimerActive] = useState(false); // 수면 타이머 활성화 상태

  // 음성 인식 결과 저장 및 처리
  const recognizedTextRef = useRef(''); // 현재 인식된 텍스트를 저장

  // 컴포넌트 마운트 시 TTS 및 Voice 초기화 및 이벤트 리스너 설정
  useEffect(() => {
    // TTS 기본 언어를 한국어로 설정
    Tts.setDefaultLanguage('ko-KR');

    // 음성 인식 이벤트 리스너 설정
    Voice.onSpeechResults = onSpeechResults; // 음성 인식 결과가 있을 때
    Voice.onSpeechError = onSpeechError;     // 음성 인식 중 오류 발생 시
    Voice.onSpeechEnd = onSpeechEnd;         // 음성 인식 세션 종료 시

    // 컴포넌트 언마운트 시 리스너 제거 및 자원 해제
    return () => {
      Voice.destroy().then(Voice.removeAllListeners); // 음성 인식 리스너 모두 제거 및 파괴
      Tts.stop(); // 진행 중인 TTS 중단
    };
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때만 실행되도록 합니다.

  // --- 음성 인식 이벤트 핸들러 ---

  // 음성 인식 결과가 있을 때 호출됩니다.
  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      recognizedTextRef.current = e.value[0]; // 가장 유력한 결과 저장
      console.log('인식된 음성:', recognizedTextRef.current);
    }
  };

  // 음성 인식 중 오류 발생 시 호출됩니다.
  const onSpeechError = (e:) => {
    console.error('음성 인식 오류:', e);
    // 오류 발생 시 사용자가 응답하지 않은 것으로 간주하여 음악 중단 처리
    handleVoiceInteractionResult(false);
  };

  // 음성 인식 세션이 끝날 때 호출됩니다. (Voice.stop() 호출 시 또는 자연스럽게 종료 시)
  const onSpeechEnd = () => {
    console.log('음성 인식 세션 종료.');
    // 세션이 끝났지만 아직 응답이 처리되지 않았다면,
    // (예: 타임아웃으로 인해 Voice.stop()이 먼저 호출된 경우)
    // 최종적으로 응답을 처리합니다.
    // 이 로직은 `speechPromise` 내부에서 타임아웃과 함께 처리되므로 여기서는 추가 로직이 필요 없을 수 있습니다.
  };

  // --- 마이크 권한 요청 함수 ---
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

  // --- 음성 상호작용 처리 함수 ---
  const handleVoiceInteraction = async () => {
    await TrackPlayer.pause(); // 음악 일시 중지

    try {
      // 마이크 권한 확인 및 요청
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('권한 필요', '마이크 권한이 없어 수면모드 기능을 사용할 수 없습니다.');
        handleVoiceInteractionResult(false); // 권한이 없으므로 잠든 것으로 간주하여 음악 중단
        return;
      }

      // '잠들었어요?'라고 음성으로 질문
      await Tts.speak('잠들었어요?');

      recognizedTextRef.current = ''; // 새로운 음성 인식을 위해 초기화
      let voiceResponseHandled = false; // 응답이 처리되었는지 확인하는 플래그

      // Promise를 사용하여 음성 인식 흐름을 관리
      const speechPromise = new Promise(async (resolve) => {
        // Voice 리스너는 useEffect에서 설정되어 있으므로 here에서 추가적인 설정은 필요 없지만,
        // 특정 상황에 따라 onSpeechResults에서 직접 resolve를 호출하여 흐름을 제어할 수 있습니다.
        // 여기서는 onSpeechResults 내부에서 즉시 처리하지 않고, Voice.stop() 또는 타임아웃 시 resolve하도록 구성합니다.

        // 음성 인식을 시작합니다. (한국어 'ko-KR')
        await Voice.start('ko-KR');

        // 일정 시간(7초) 동안 응답이 없으면 타임아웃 처리
        const speechTimeout = setTimeout(() => {
          if (!voiceResponseHandled) {
            console.log('음성 인식 타임아웃. 사용자가 잠든 것으로 간주.');
            Voice.stop(); // 음성 인식 중단
            voiceResponseHandled = true;
            resolve(false); // 타임아웃 발생 시 음악 중단
          }
        }, 7000); // 7초 동안 응답 대기

        // 음성 인식 결과 또는 오류 발생 시 처리 로직
        // Note: 이 부분은 Voice.onSpeechResults/onSpeechError/onSpeechEnd 콜백에서
        // recognizedTextRef.current를 확인하고 Voice.stop()을 호출한 뒤
        // speechPromise를 resolve하도록 수정해야 합니다.
        // 현재는 onSpeechEnd가 호출될 때까지 기다리거나 타임아웃을 사용합니다.
        // 더 견고한 처리를 위해, onSpeechResults에서 `recognizedTextRef.current`를 확인하고,
        // 조건에 따라 `Voice.stop()`을 호출한 후 `resolve(true/false)`를 하는 것이 좋습니다.

        // 임시 로직: onSpeechResults에서 즉시 처리 (더 반응적인 UI를 위해)
        Voice.onSpeechResults = (e) => {
          if (e.value && e.value.length > 0 && !voiceResponseHandled) {
            recognizedTextRef.current = e.value[0];
            console.log('인식된 음성 (즉시 처리):', recognizedTextRef.current);

            if (recognizedTextRef.current.includes('아니요') || recognizedTextRef.current.includes('아니오')) {
              voiceResponseHandled = true;
              clearTimeout(speechTimeout); // 타임아웃 제거
              Voice.stop(); // 음성 인식 중단
              resolve(true); // '아니요' 응답: 음악 계속 재생
            } else if (recognizedTextRef.current.includes('예') || recognizedTextRef.current.includes('네')) {
              voiceResponseHandled = true;
              clearTimeout(speechTimeout); // 타임아웃 제거
              Voice.stop(); // 음성 인식 중단
              resolve(false); // '예' 응답: 음악 중단
            }
          }
        };

        // Voice.onSpeechEnd는 `Voice.stop()`이 호출된 후에 실행됩니다.
        // 만약 타임아웃이 발생하여 Voice.stop()이 호출되면 이 콜백이 실행되고,
        // `speechPromise`가 아직 resolve되지 않았다면 여기에서 처리할 수 있습니다.
        Voice.onSpeechEnd = () => {
            if (!voiceResponseHandled) {
                console.log('Voice session ended without explicit response.');
                voiceResponseHandled = true;
                resolve(false); // 명확한 응답 없으면 음악 중단
            }
        };
      });

      const continueMusic = await speechPromise; // 음성 인식 결과 대기
      handleVoiceInteractionResult(continueMusic); // 결과에 따라 음악 제어
    } catch (error) {
      console.error('음성 상호작용 중 오류:', error);
      handleVoiceInteractionResult(false); // 오류 발생 시 잠든 것으로 간주하여 음악 중단
    } finally {
      // 음성 인식이 끝나면 리스너를 다시 초기 상태로 복원합니다.
      // (useEffect의 cleanup이 아닌, 개별 상호작용 후 정리)
      Voice.destroy().then(Voice.removeAllListeners);
      // TTS 리스너는 일반적으로 계속 유지됩니다.
    }
  };

  // --- 음성 상호작용 결과에 따른 처리 함수 ---
  const handleVoiceInteractionResult = async (continueMusic) => {
    if (continueMusic) {
      await TrackPlayer.play(); // 음악 재생 재개
      Alert.alert('수면모드', '음악을 계속 재생합니다.');
    } else {
      await TrackPlayer.stop(); // 음악 중단
      // 사용자에게 알림 후 앱 종료 또는 뒤로가기
      Alert.alert(
        '수면모드',
        '음악이 중단되고 앱이 종료됩니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    }
    setSleepTimerActive(false); // 수면 타이머 비활성화 상태로 변경
    sleepTimerRef.current = null; // 타이머 ID 초기화
  };