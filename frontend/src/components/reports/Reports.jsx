// کۆمپۆنەنتی ڕاپۆرتەکان
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSalesReport, getProfitLossReport, getTopSellingProducts, getTopServices, getInventoryReport } from '../../services/api';
import { formatCurrency, getTodayDate } from '../../utils/helpers';
import Alert from '../common/Alert';
import '../../styles/components/Reports.css';

const Reports = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: getTodayDate(),
    groupBy: ''
  });

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy
      };
      const response = await getSalesReport(params);
      setReportData(response.data.data);
      setAlert(null);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLossReport = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      const response = await getProfitLossReport(params);
      setReportData(response.data.data);
      setAlert(null);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 10
      };
      const response = await getTopSellingProducts(params);
      setReportData(response.data.data);
      setAlert(null);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopServices = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 10
      };
      const response = await getTopServices(params);
      setReportData(response.data.data);
      setAlert(null);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      const response = await getInventoryReport();
      setReportData(response.data.data);
      setAlert(null);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    setReportData(null);
    
    switch (activeTab) {
      case 'sales':
        fetchSalesReport();
        break;
      case 'profit':
        fetchProfitLossReport();
        break;
      case 'products':
        fetchTopProducts();
        break;
      case 'services':
        fetchTopServices();
        break;
      case 'inventory':
        fetchInventoryReport();
        break;
      default:
        break;
    }
  };

  const renderSalesReport = () => {
    if (!reportData) return null;

    if (Array.isArray(reportData)) {
      return (
        <div className="report-result">
          <h3>ڕاپۆرتی فرۆشتن</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>{filters.groupBy === 'day' ? 'ڕۆژ' : filters.groupBy === 'month' ? 'مانگ' : 'ماوە'}</th>
                <th>ژمارەی فرۆشتن</th>
                <th>کۆی سەرەتایی</th>
                <th>داشکاندن</th>
                <th>کۆی گشتی</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  <td>{row.date || 'کۆی گشتی'}</td>
                  <td>{row.sales_count}</td>
                  <td>{formatCurrency(row.subtotal)} IQD</td>
                  <td className="text-danger">{formatCurrency(row.discount)} IQD</td>
                  <td className="text-success"><strong>{formatCurrency(row.revenue)} IQD</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="report-result">
          <h3>ڕاپۆرتی فرۆشتن</h3>
          <div className="report-summary-grid">
            <div className="summary-item">
              <span className="summary-label">ژمارەی فرۆشتن:</span>
              <span className="summary-value">{reportData.sales_count}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">کۆی سەرەتایی:</span>
              <span className="summary-value">{formatCurrency(reportData.subtotal)} IQD</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">داشکاندن:</span>
              <span className="summary-value text-danger">{formatCurrency(reportData.discount)} IQD</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">کۆی گشتی:</span>
              <span className="summary-value text-success"><strong>{formatCurrency(reportData.revenue)} IQD</strong></span>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderProfitLossReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-result">
        <h3>ڕاپۆرتی قازانج و زەرەر</h3>
        <div className="profit-loss-report">
          <div className="report-section">
            <h4>داهات</h4>
            <div className="report-item">
              <span>کۆی داهات:</span>
              <span className="value">{formatCurrency(reportData.revenue)} IQD</span>
            </div>
          </div>

          <div className="report-section">
            <h4>تێچوونەکان</h4>
            <div className="report-item">
              <span>تێچووی بەرهەمەکان:</span>
              <span className="value text-danger">{formatCurrency(reportData.product_cost)} IQD</span>
            </div>
            <div className="report-item">
              <span>خەرجییەکان:</span>
              <span className="value text-danger">{formatCurrency(reportData.expenses)} IQD</span>
            </div>
            <div className="report-item total">
              <span>کۆی تێچوون:</span>
              <span className="value text-danger">{formatCurrency(reportData.product_cost + reportData.expenses)} IQD</span>
            </div>
          </div>

          <div className="report-section">
            <h4>قازانج</h4>
            <div className="report-item">
              <span>قازانجی ناوخۆیی:</span>
              <span className="value">{formatCurrency(reportData.gross_profit)} IQD</span>
            </div>
            <div className="report-item total">
              <span>قازانجی پاک:</span>
              <span className={`value ${reportData.net_profit >= 0 ? 'text-success' : 'text-danger'}`}>
                <strong>{formatCurrency(reportData.net_profit)} IQD</strong>
              </span>
            </div>
            <div className="report-item">
              <span>ڕێژەی قازانج:</span>
              <span className="value">{reportData.profit_margin}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopProducts = () => {
    if (!reportData || reportData.length === 0) return <p className="text-center">هیچ داتایەک نییە</p>;

    return (
      <div className="report-result">
        <h3>بەرهەمە باشەکان (10 یەکەمین)</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ناوی بەرهەم</th>
              <th>بڕی فرۆشراو</th>
              <th>کۆی داهات</th>
              <th>ژمارەی فرۆشتن</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.item_name}</td>
                <td>{item.total_quantity}</td>
                <td className="text-success">{formatCurrency(item.total_revenue)} IQD</td>
                <td>{item.sales_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTopServices = () => {
    if (!reportData || reportData.length === 0) return <p className="text-center">هیچ داتایەک نییە</p>;

    return (
      <div className="report-result">
        <h3>خزمەتگوزاری باشەکان (10 یەکەمین)</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ناوی خزمەتگوزاری</th>
              <th>ژمارەی جار</th>
              <th>کۆی داهات</th>
              <th>ژمارەی فرۆشتن</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.item_name}</td>
                <td>{item.total_count}</td>
                <td className="text-success">{formatCurrency(item.total_revenue)} IQD</td>
                <td>{item.sales_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-result">
        <h3>ڕاپۆرتی کۆگا</h3>
        
        <div className="report-summary-grid">
          <div className="summary-item">
            <span className="summary-label">کۆی بەرهەمەکان:</span>
            <span className="summary-value">{reportData.inventory_value.total_products}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">نرخی کڕین:</span>
            <span className="summary-value">{formatCurrency(reportData.inventory_value.total_cost)} IQD</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">نرخی فرۆشتن:</span>
            <span className="summary-value text-success">{formatCurrency(reportData.inventory_value.potential_revenue)} IQD</span>
          </div>
        </div>

        {reportData.low_stock_items.length > 0 && (
          <>
            <h4 className="mt-3">بەرهەمە کەمەکان ({reportData.low_stock_items.length})</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ناوی بەرهەم</th>
                  <th>بڕ</th>
                  <th>کەمترین بڕ</th>
                </tr>
              </thead>
              <tbody>
                {reportData.low_stock_items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{language === 'ku' ? item.name_ku : item.name_ar}</td>
                    <td className="text-danger">{item.quantity}</td>
                    <td>{item.min_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>{t('menu_reports')}</h1>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* تابەکان */}
      <div className="report-tabs">
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          📊 {t('sales_report')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          💰 {t('profit_loss_report')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 بەرهەمە باشەکان
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          ✂️ خزمەتگوزاری باشەکان
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📋 {t('inventory_report')}
        </button>
      </div>

      {/* فلتەرەکان */}
      {activeTab !== 'inventory' && (
        <div className="report-filters">
          <div className="filter-group">
            <label>{t('date_from')}:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>{t('date_to')}:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          {activeTab === 'sales' && (
            <div className="filter-group">
              <label>جیاکردن بە:</label>
              <select
                value={filters.groupBy}
                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
              >
                <option value="">بێ جیاکردن</option>
                <option value="day">ڕۆژانە</option>
                <option value="month">مانگانە</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="report-actions">
        <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
          {loading ? t('loading') : `📄 ${t('generate_report')}`}
        </button>
      </div>

      {/* نیشاندانی ڕاپۆرت */}
      <div className="report-content">
        {loading && <div className="loading">{t('loading')}</div>}
        
        {!loading && reportData && (
          <>
            {activeTab === 'sales' && renderSalesReport()}
            {activeTab === 'profit' && renderProfitLossReport()}
            {activeTab === 'products' && renderTopProducts()}
            {activeTab === 'services' && renderTopServices()}
            {activeTab === 'inventory' && renderInventoryReport()}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;