// context/LanguageContext.tsx
import React, {createContext, useState, ReactNode, useContext} from 'react';
import strings from '../../constants/lang';

interface LanguageContextProps {
  language: string;
  changeLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  changeLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<string>('kr');

  const changeLanguage = (lang: string) => {
    strings.setLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{language, changeLanguage}}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
