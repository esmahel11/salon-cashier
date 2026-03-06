// کۆمپۆنەنتی کارتی ئامار
import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import '../../styles/components/StatsCard.css';

const StatsCard = ({ icon, title, value, isCurrency = false, color = 'primary' }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">
          {isCurrency ? formatCurrency(value) : value}
          {isCurrency && <span className="currency"> IQD</span>}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;