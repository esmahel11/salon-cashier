// کۆمپۆنەنتی هێدەر
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import '../../styles/components/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">{t('app_name')}</h1>
        </div>

        <div className="header-right">
          <LanguageSwitcher />
          
          <div className="user-info">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">
              ({user?.role === 'admin' ? t('role_admin') : t('role_employee')})
            </span>
          </div>

          <button className="logout-btn" onClick={logout}>
            🚪 {t('menu_logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;