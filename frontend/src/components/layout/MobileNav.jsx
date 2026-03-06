import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/MobileNav.css';

const MobileNav = () => {
  return (
    <nav className="mobile-nav">
      <NavLink to="/dashboard" className="mobile-nav-item">
        <span className="nav-icon">📊</span>
        <span className="nav-label">سەرەکی</span>
      </NavLink>
      
      <NavLink to="/sales" className="mobile-nav-item">
        <span className="nav-icon">💰</span>
        <span className="nav-label">فرۆشتن</span>
      </NavLink>
      
      <NavLink to="/inventory" className="mobile-nav-item">
        <span className="nav-icon">📦</span>
        <span className="nav-label">کۆگا</span>
      </NavLink>
      
      <NavLink to="/services" className="mobile-nav-item">
        <span className="nav-icon">✂️</span>
        <span className="nav-label">خزمەتگوزاری</span>
      </NavLink>
      
      <NavLink to="/customers" className="mobile-nav-item">
        <span className="nav-icon">👥</span>
        <span className="nav-label">کڕیار</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
