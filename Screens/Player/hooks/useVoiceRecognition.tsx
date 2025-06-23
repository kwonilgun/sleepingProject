/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { ReactNativeTts } from 'react-native-tts';
import Voice from '@react-native-voice/voice';

interface UseVoiceRecognitionProps {
  recognizedTextRef: React.MutableRefObject<string>;
  voiceResponseHandledRef: React.MutableRefObject<boolean>;
  handleVoiceInteractionResult: (continueMusic: boolean) => Promise<void>;
  Voice: typeof Voice;
}

export const useVoiceRecognition = ({
  recognizedTextRef,
  voiceResponseHandledRef,
  handleVoiceInteractionResult,
  Voice,
}: UseVoiceRecognitionProps) => {


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
        else{
          voiceResponseHandledRef.current = true;
          Voice.stop().then(() => {
            handleVoiceInteractionResult(true);
          });
        }
      }
    };

    const onSpeechError = (e: any) => {
      console.log('음성 인식 오류:', e);
    };

    const onSpeechEnd = () => {
      console.log('<<<<<<<음성 인식 세션 종료>>>>>>>');
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // return {requestMicrophonePermission };
};