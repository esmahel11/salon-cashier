// کۆمپۆنەنتی گۆڕینی زمان
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/components/LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${language === 'ku' ? 'active' : ''}`}
        onClick={() => changeLanguage('ku')}
      >
        کوردی
      </button>
      <button
        className={`lang-btn ${language === 'ar' ? 'active' : ''}`}
        onClick={() => changeLanguage('ar')}
      >
        عربي
      </button>
    </div>
  );
};

export default LanguageSwitcher;