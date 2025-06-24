import React, { createContext, useState, useContext, ReactNode } from 'react';

// SleepTimerContext에서 관리할 상태의 타입을 정의합니다.
interface SleepTimerContextType {
  initialSleepDelay: number;
  setInitialSleepDelay: (minutes: number) => void;
}

// Context를 생성합니다. 기본값은 적절히 설정하거나 나중에 Provider에서 제공할 것입니다.
const SleepTimerContext = createContext<SleepTimerContextType | undefined>(undefined);

// Context Provider 컴포넌트를 생성합니다.
interface SleepTimerProviderProps {
  children: ReactNode;
}

export const SleepTimerProvider: React.FC<SleepTimerProviderProps> = ({ children }) => {
  const [initialSleepDelay, setInitialSleepDelay] = useState<number>(0); // 초기값 설정 (예: 0분)

  const contextValue = {
    initialSleepDelay,
    setInitialSleepDelay,
  };

  return (
    <SleepTimerContext.Provider value={contextValue}>
      {children}
    </SleepTimerContext.Provider>
  );
};

// Context 값을 쉽게 사용할 수 있는 커스텀 훅을 생성합니다.
export const useSleepTimer = () => {
  const context = useContext(SleepTimerContext);
  if (context === undefined) {
    throw new Error('useSleepTimer must be used within a SleepTimerProvider');
  }
  return context;
};