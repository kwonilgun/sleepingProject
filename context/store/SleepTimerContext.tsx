import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SleepTimerContextType {
  sleepTimerActive: boolean; // 이 부분 추가
  setSleepTimerActive: React.Dispatch<React.SetStateAction<boolean>>; // 이 부분 추가
  initialSleepDelay: number;
  setInitialSleepDelay: React.Dispatch<React.SetStateAction<number>>;
}

const SleepTimerContext = createContext<SleepTimerContextType | undefined>(undefined);

interface SleepTimerProviderProps {
  children: ReactNode;
}

export const SleepTimerProvider: React.FC<SleepTimerProviderProps> = ({ children }) => {
  const [sleepTimerActive, setSleepTimerActive] = useState<boolean>(false); // 상태 추가
  const [initialSleepDelay, setInitialSleepDelay] = useState<number>(0.1);

  return (
    <SleepTimerContext.Provider value={{
      sleepTimerActive,       // 값으로 전달
      setSleepTimerActive,    // setter도 전달
      initialSleepDelay,
      setInitialSleepDelay
    }}>
      {children}
    </SleepTimerContext.Provider>
  );
};

export const useSleepTimer = () => {
  const context = useContext(SleepTimerContext);
  if (context === undefined) {
    throw new Error('useSleepTimer must be used within a SleepTimerProvider');
  }
  return context;
};