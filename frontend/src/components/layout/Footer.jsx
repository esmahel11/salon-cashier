// کۆمپۆنەنتی فووتەر
import React from 'react';
import '../../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {currentYear} سیستەمی کاشێری ئارایشتگا - هەموو مافێک پارێزراوە</p>
      </div>
    </footer>
  );
};

export default Footer;