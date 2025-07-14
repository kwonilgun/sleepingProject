/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { ReactNativeTts } from 'react-native-tts';
// import tts from 'react-native-tts';
// import Voice from '@react-native-voice/voice';

interface UseTtsSetupProps {
  recognizedTextRef: React.MutableRefObject<string>;
  speechTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  voiceResponseHandledRef: React.MutableRefObject<boolean>;
  startVoiceRecognition: () => void;
  // handleVoiceInteractionResult: (continueMusic: boolean) => Promise<void>;
  Tts: ReactNativeTts ;
  // Voice: typeof Voice;
  Alert: typeof Alert;
}

export const useTtsSetup = ({
  recognizedTextRef,
  speechTimeoutRef,
  voiceResponseHandledRef,
  // handleVoiceInteractionResult,
  startVoiceRecognition,
  Tts,
  // Voice,
  Alert,
}: UseTtsSetupProps) => {

  const requestMicrophonePermission = useCallback(async () => {
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
    return true;
  }, []);

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


  // TTS. 초기화
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
      const onSpeechStart = () => console.log('useTtsSetup TTS 시작');
      const onSpeechProgress = (event:any ) => console.log("useTtsSetup progress", event);
      const onSpeechFinish = (event:any ) => {
        console.log('useTtsSetup finish', event);
        startVoiceRecognition();
      };
      const onSpeechCancel = (event:any) => console.log("useTtsSetup cancel", event);

      // TTS 이벤트 리스너 등록
      Tts.addEventListener('tts-start', onSpeechStart);
      Tts.addEventListener('tts-progress', onSpeechProgress);
      Tts.addEventListener('tts-finish', onSpeechFinish);
      Tts.addEventListener('tts-cancel', onSpeechCancel);

      // ... 기존의 Voice 이벤트 리스너 설정 ...

      return () => {
        console.log('useTtsSetup, useEffect, tts 리스너 제거 ....')
        // Tts 객체와 removeEventListener 존재 여부 디버깅
        console.log('Tts in cleanup:', Tts);
        console.log('typeof Tts.removeEventListener in cleanup:', typeof (Tts as any).removeEventListener); // 타입 캐스팅으로 에러 회피

        if (Tts && typeof (Tts as any).removeEventListener === 'function') { // typeof 체크 추가
          // Tts.removeEventListener('tts-start', onSpeechStart);
          // Tts.removeEventListener('tts-progress', onSpeechProgress);
          // Tts.removeEventListener('tts-finish', onSpeechFinish);
          // Tts.removeEventListener('tts-cancel', onSpeechCancel);
        } else {
            console.warn('Tts 또는 Tts.removeEventListener가 유효하지 않아 리스너를 제거할 수 없습니다.');
        }

        // Tts.stop()은 리스너 제거와는 별개로 Tts 재생을 멈추는 역할을 합니다.
        // 리스너 제거 문제가 아니더라도 Tts 재생이 필요 없으면 호출하는 것이 좋습니다.
        if (Tts && typeof Tts.stop === 'function') {
            // Tts.stop();
        }
      };
}, []);


  // return {requestMicrophonePermission };
};