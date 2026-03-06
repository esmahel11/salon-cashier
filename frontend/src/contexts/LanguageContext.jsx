// کۆنتێکستی زمان
import React, { createContext, useState, useContext, useEffect } from 'react';
import { TEXTS_KU, TEXTS_AR } from '../utils/constants';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage دەبێت لە ناو LanguageProvider دا بەکاربهێنرێت');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ku');
  const [texts, setTexts] = useState(TEXTS_KU);

  // وەرگرتنی زمانی خەزنکراو
  useEffect(() => {
    const savedLanguage = getFromLocalStorage('language');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  // گۆڕینی زمان
  const changeLanguage = (lang) => {
    if (lang === 'ku') {
      setLanguage('ku');
      setTexts(TEXTS_KU);
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ku');
    } else if (lang === 'ar') {
      setLanguage('ar');
      setTexts(TEXTS_AR);
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
    saveToLocalStorage('language', lang);
  };

  // وەرگرتنی دەق بە پێی زمان
  const t = (key) => {
    return texts[key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    texts
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};