/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import tts from 'react-native-tts';
import Voice from '@react-native-voice/voice';

interface UseVoiceRecognitionProps {
  recognizedTextRef: React.MutableRefObject<string>;
  speechTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  voiceResponseHandledRef: React.MutableRefObject<boolean>;
  handleVoiceInteractionResult: (continueMusic: boolean) => Promise<void>;
  Tts: typeof tts;
  Voice: typeof Voice;
  Alert: typeof Alert;
}

export const useVoiceRecognition = ({
  recognizedTextRef,
  speechTimeoutRef,
  voiceResponseHandledRef,
  handleVoiceInteractionResult,
  Tts,
  Voice,
  Alert,
}: UseVoiceRecognitionProps) => {

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

  const startVoiceRecognition = useCallback(async () => {
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
      console.error('음성 상호작용 시작 오류:', error);
      handleVoiceInteractionResult(false);
    }
  }, [Voice, speechTimeoutRef, voiceResponseHandledRef, handleVoiceInteractionResult]);


  useEffect(() => {
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
      Tts.addEventListener('tts-progress', (event) => console.log("progress", event)),
      Tts.addEventListener('tts-finish', (event) => {
        console.log("finish", event);
        startVoiceRecognition();
      }),
      Tts.addEventListener('tts-cancel', (event) => console.log("cancel", event)),
    ];

    const onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0 && !voiceResponseHandledRef.current) {
        recognizedTextRef.current = e.value[0];
        if (recognizedTextRef.current.includes('아니요') || recognizedTextRef.current.includes('아니') || recognizedTextRef.current.includes('노')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(false); // Changed to false based on prompt
          });
        } else if (recognizedTextRef.current.includes('예') || recognizedTextRef.current.includes('네') || recognizedTextRef.current.includes('예스')) {
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(true);
          });
        }
      }
    };

    const onSpeechError = (e: any) => {
      console.log('음성 인식 오류:', e);
      // If error occurs and no response has been handled, consider it as 'no' (user didn't respond)
      if (!voiceResponseHandledRef.current) {
        voiceResponseHandledRef.current = true;
        handleVoiceInteractionResult(false);
      }
    };

    const onSpeechEnd = () => {
      console.log('<<<<<<<음성 인식 세션 종료>>>>>>>');
      // If speech ends but no response was handled, treat as no response
      if (!voiceResponseHandledRef.current) {
        voiceResponseHandledRef.current = true;
        handleVoiceInteractionResult(false);
      }
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      ttsListeners.forEach(listener => listener.remove());
      Voice.destroy().then(Voice.removeAllListeners);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [Tts, Voice, recognizedTextRef, speechTimeoutRef, voiceResponseHandledRef, handleVoiceInteractionResult, startVoiceRecognition]);

  return { requestMicrophonePermission, startVoiceRecognition };
};