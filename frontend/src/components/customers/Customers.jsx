// کۆمپۆنەنتی کڕیارەکان
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllCustomers, deleteCustomer, addCustomer, updateCustomer } from '../../services/api';
import { formatCurrency, isAdmin, isValidPhone, isValidEmail } from '../../utils/helpers';
import SearchBar from '../common/SearchBar';
import Alert from '../common/Alert';
import '../../styles/components/Customers.css';

const Customers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers();
      setCustomers(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t('delete_confirm')}\n${name}`)) {
      return;
    }

    try {
      await deleteCustomer(id);
      setAlert({ type: 'success', message: t('delete_success') });
      fetchCustomers();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      setAlert({ type: 'error', message: 'تکایە ناو و ژمارەی مۆبایل بنووسە' });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setAlert({ type: 'error', message: 'ژمارەی مۆبایل نادروستە' });
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setAlert({ type: 'error', message: 'ئیمەیڵ نادروستە' });
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await addCustomer(formData);
      }
      setAlert({ type: 'success', message: t('save_success') });
      closeModal();
      fetchCustomers();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>{t('menu_customers')}</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          ➕ {t('add_customer')}
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-actions">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('customer_name')}</th>
              <th>{t('phone')}</th>
              <th>{t('email')}</th>
              <th>{t('total_purchases')}</th>
              <th>{t('visit_count')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  هیچ کڕیارێک نەدۆزرایەوە
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr key={customer.id}>
                  <td>{index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{formatCurrency(customer.total_purchases)} IQD</td>
                  <td>{customer.visit_count}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => openModal(customer)}
                    >
                      ✏️
                    </button>
                    {isAdmin(user) && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(customer.id, customer.name)}
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

      {/* مۆداڵی زیادکردن/دەستکاری */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? t('edit') : t('add')} {t('customer_name')}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('customer_name')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('phone')} *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="07XX XXX XXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label>{t('address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
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

export default Customers;