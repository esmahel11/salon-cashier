// کۆمپۆنەنتی خەرجییەکان
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllExpenses, addExpense, deleteExpense, getExpenseSummary } from '../../services/api';
import { formatCurrency, formatDate, getTodayDate, isAdmin } from '../../utils/helpers';
import Alert from '../common/Alert';
import '../../styles/components/Expenses.css';

const Expenses = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({ total_expenses: 0, count: 0 });
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [formData, setFormData] = useState({
    category_ku: '',
    category_ar: '',
    description: '',
    amount: '',
    expense_date: getTodayDate(),
    payment_method: 'cash'
  });

  const expenseCategories = {
    ku: ['کرێی شوێن', 'کەرەبا و ئاو', 'مووچە', 'چاککردنەوە', 'پاککردنەوە', 'هیتر'],
    ar: ['إيجار المحل', 'الكهرباء والماء', 'الرواتب', 'الصيانة', 'التنظيف', 'أخرى']
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [filterStartDate, filterEndDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const response = await getAllExpenses(params);
      setExpenses(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const response = await getExpenseSummary(params);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;

    try {
      await deleteExpense(id);
      setAlert({ type: 'success', message: t('delete_success') });
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const openModal = () => {
    setFormData({
      category_ku: '',
      category_ar: '',
      description: '',
      amount: '',
      expense_date: getTodayDate(),
      payment_method: 'cash'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCategoryChange = (value, lang) => {
    const index = expenseCategories[lang].indexOf(value);
    if (index !== -1) {
      setFormData({
        ...formData,
        category_ku: expenseCategories.ku[index],
        category_ar: expenseCategories.ar[index]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_ku || !formData.description || !formData.amount) {
      setAlert({ type: 'error', message: 'تکایە خانە پێویستەکان پڕ بکەرەوە' });
      return;
    }

    try {
      await addExpense(formData);
      setAlert({ type: 'success', message: t('save_success') });
      closeModal();
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>{t('menu_expenses')}</h1>
        <button className="btn btn-primary" onClick={openModal}>
          ➕ {t('add_expense')}
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* کورتەی خەرجییەکان */}
      <div className="expenses-summary">
        <div className="summary-card">
          <div className="summary-icon">💸</div>
          <div className="summary-content">
            <h3>کۆی خەرجییەکان</h3>
            <p className="summary-value">{formatCurrency(summary.total_expenses)} IQD</p>
            <span className="summary-label">ژمارە: {summary.count}</span>
          </div>
        </div>
      </div>

      {/* فلتەرەکان */}
      <div className="page-filters">
        <div className="filter-group">
          <label>{t('date_from')}:</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>{t('date_to')}:</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <button className="btn btn-secondary" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}>
          🔄 ڕێسێت
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('expense_category')}</th>
              <th>{t('expense_description')}</th>
              <th>{t('amount')}</th>
              <th>{t('expense_date')}</th>
              <th>{t('payment_method')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  هیچ خەرجییەک نەدۆزرایەوە
                </td>
              </tr>
            ) : (
              expenses.map((expense, index) => (
                <tr key={expense.id}>
                  <td>{index + 1}</td>
                  <td>{language === 'ku' ? expense.category_ku : expense.category_ar}</td>
                  <td>{expense.description}</td>
                  <td className="text-danger">{formatCurrency(expense.amount)} IQD</td>
                  <td>{formatDate(expense.expense_date)}</td>
                  <td>{expense.payment_method === 'cash' ? t('cash') : t('card')}</td>
                  <td className="actions-cell">
                    {isAdmin(user) && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(expense.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مۆداڵی زیادکردنی خەرجی */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('add_expense')}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('expense_category')} *</label>
                <select
                  value={language === 'ku' ? formData.category_ku : formData.category_ar}
                  onChange={(e) => handleCategoryChange(e.target.value, language)}
                  required
                >
                  <option value="">هەڵبژێرە...</option>
                  {expenseCategories[language].map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('expense_description')} *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('amount')} * (IQD)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('expense_date')} *</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('payment_method')}</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="cash">{t('cash')}</option>
                  <option value="card">{t('card')}</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;