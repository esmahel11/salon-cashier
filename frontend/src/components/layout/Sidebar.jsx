// کۆمپۆنەنتی مینیۆی لاتەنیشت
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isAdmin } from '../../utils/helpers';
import '../../styles/components/Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: t('menu_dashboard'), role: 'all' },
    { path: '/sales', icon: '💰', label: t('menu_sales'), role: 'all' },
    { path: '/inventory', icon: '📦', label: t('menu_inventory'), role: 'all' },
    { path: '/services', icon: '✂️', label: t('menu_services'), role: 'all' },
    { path: '/customers', icon: '👥', label: t('menu_customers'), role: 'all' },
    { path: '/appointments', icon: '📅', label: t('menu_appointments'), role: 'all' },
    { path: '/expenses', icon: '💸', label: t('menu_expenses'), role: 'all' },
    { path: '/reports', icon: '📈', label: t('menu_reports'), role: 'all' },
    { path: '/users', icon: '👤', label: t('menu_users'), role: 'admin' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          // پشکنینی دەسەڵات
          if (item.role === 'admin' && !isAdmin(user)) {
            return null;
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;