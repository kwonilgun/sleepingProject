import { useState, useEffect, useRef } from 'react';
import ScreenBrightness from 'react-native-screen-brightness';

interface UseScreenSaverOptions {
  timeoutMinutes?: number;
  isPlaying: boolean;
  initialBrightness?: number;
  saverBrightness?: number;
}

const useScreenSaver = ({
  timeoutMinutes = 1,
  isPlaying,
  initialBrightness = 0.7,
  saverBrightness = 0.1
}: UseScreenSaverOptions) => {
  const [isScreenSaverActive, setIsScreenSaverActive] = useState(false);
  const screenSaverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetScreenSaverTimer = () => {
    // 스크린 세이버 비활성화
    console.log('useScreenSaver, resetScreenSaverTimer, isScreenSaverActive, isPlaying, screenSaverTimeoutRef : ', isScreenSaverActive, isPlaying, screenSaverTimeoutRef.current );
    if (isScreenSaverActive) {
      setIsScreenSaverActive(false);
      ScreenBrightness.setBrightness(initialBrightness);
    }
    
    // 기존 타이머 클리어
    if (screenSaverTimeoutRef.current) {
      clearTimeout(screenSaverTimeoutRef.current);
    }
    
    // 새 타이머 설정 (재생 중일 때만)
    if (isPlaying) {
        console.log('useScreenSaver, isPlaying true')
      screenSaverTimeoutRef.current = setTimeout(() => {
        setIsScreenSaverActive(true);
        ScreenBrightness.setBrightness(saverBrightness);
      }, timeoutMinutes * 60 * 1000);
    }
  };

  // 컴포넌트 마운트 시 초기 밝기 설정
  useEffect(() => {
    ScreenBrightness.setBrightness(initialBrightness);
    
    return () => {
      // 컴포넌트 언마운트 시 타이머 클리어 및 밝기 복원
      console.log('useScreenSaver return 복귀');
      if (screenSaverTimeoutRef.current) {
        clearTimeout(screenSaverTimeoutRef.current);
      }
      ScreenBrightness.setBrightness(initialBrightness);
    };
  }, []);

  // 재생 상태 변경 시 타이머 리셋
  useEffect(() => {
    console.log('isPlaying screen saver timer 리셋');
    resetScreenSaverTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return {
    isScreenSaverActive,
    resetScreenSaverTimer,
  };
};

export default useScreenSaver;