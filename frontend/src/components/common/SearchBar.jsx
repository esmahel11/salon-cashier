// کۆمپۆنەنتی گەڕان
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/components/SearchBar.css';

const SearchBar = ({ value, onChange, placeholder }) => {
  const { t } = useLanguage();

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('search')}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;