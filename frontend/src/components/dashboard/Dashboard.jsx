// کۆمپۆنەنتی داشبۆرد
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDashboardStats, getLowStockProducts } from '../../services/api';
import StatsCard from './StatsCard';
import Alert from '../common/Alert';
import '../../styles/components/Dashboard.css';

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, lowStockRes] = await Promise.all([
        getDashboardStats(),
        getLowStockProducts()
      ]);

      setStats(statsRes.data.data);
      setLowStockItems(lowStockRes.data.data);
      setError('');
    } catch (err) {
      setError(t('error_occurred'));
      console.error('هەڵە لە وەرگرتنی داتای داشبۆرد:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>{t('menu_dashboard')}</h1>
      </div>

      {error && <Alert type="error" message={error} />}

      {stats && (
        <>
          <div className="stats-grid">
            <StatsCard
              icon="💰"
              title={t('today_sales')}
              value={stats.today.sales_count}
              color="primary"
            />
            <StatsCard
              icon="💵"
              title={t('today_revenue')}
              value={stats.today.revenue}
              isCurrency
              color="success"
            />
            <StatsCard
              icon="💸"
              title={t('today_expenses')}
              value={stats.today.expenses}
              isCurrency
              color="danger"
            />
            <StatsCard
              icon="📈"
              title={t('today_profit')}
              value={stats.today.profit}
              isCurrency
              color={stats.today.profit >= 0 ? 'success' : 'danger'}
            />
            <StatsCard
              icon="👥"
              title={t('total_customers')}
              value={stats.general.customers}
              color="info"
            />
            <StatsCard
              icon="📅"
              title={t('today_appointments')}
              value={stats.today.appointments}
              color="warning"
            />
          </div>

          {lowStockItems.length > 0 && (
            <div className="alert-section">
              <Alert
                type="warning"
                message={`${t('low_stock_alert')}: ${lowStockItems.length} ${t('product_name')}`}
              />
              <div className="low-stock-list">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="low-stock-item">
                    <span>{item.name_ku}</span>
                    <span className="stock-quantity">
                      {t('quantity')}: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;