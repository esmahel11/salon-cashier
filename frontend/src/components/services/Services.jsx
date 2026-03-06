// کۆمپۆنەنتی خزمەتگوزارییەکان
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllServices, deleteService, addService, updateService } from '../../services/api';
import { formatCurrency, isAdmin } from '../../utils/helpers';
import SearchBar from '../common/SearchBar';
import Alert from '../common/Alert';
import '../../styles/components/Services.css';

const Services = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name_ku: '',
    name_ar: '',
    price: '',
    duration: 30,
    description_ku: '',
    description_ar: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getAllServices();
      setServices(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchTerm) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter(service =>
      service.name_ku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t('delete_confirm')}\n${name}`)) {
      return;
    }

    try {
      await deleteService(id);
      setAlert({ type: 'success', message: t('delete_success') });
      fetchServices();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name_ku: service.name_ku,
        name_ar: service.name_ar,
        price: service.price,
        duration: service.duration,
        description_ku: service.description_ku || '',
        description_ar: service.description_ar || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name_ku: '',
        name_ar: '',
        price: '',
        duration: 30,
        description_ku: '',
        description_ar: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name_ku || !formData.name_ar || !formData.price) {
      setAlert({ type: 'error', message: 'تکایە خانە پێویستەکان پڕ بکەرەوە' });
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await addService(formData);
      }
      setAlert({ type: 'success', message: t('save_success') });
      closeModal();
      fetchServices();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <h1>{t('menu_services')}</h1>
        {isAdmin(user) && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            ➕ {t('add')} {t('service')}
          </button>
        )}
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
              <th>{t('service')}</th>
              <th>{t('price')}</th>
              <th>{t('duration')}</th>
              <th>{t('description')}</th>
              <th>{t('status')}</th>
              {isAdmin(user) && <th>{t('actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  هیچ خزمەتگوزاریەک نەدۆزرایەوە
                </td>
              </tr>
            ) : (
              filteredServices.map((service, index) => (
                <tr key={service.id}>
                  <td>{index + 1}</td>
                  <td>{language === 'ku' ? service.name_ku : service.name_ar}</td>
                  <td>{formatCurrency(service.price)} IQD</td>
                  <td>{service.duration} {t('minutes')}</td>
                  <td>{language === 'ku' ? service.description_ku : service.description_ar || '-'}</td>
                  <td>
                    <span className={`badge ${service.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {service.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  {isAdmin(user) && (
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => openModal(service)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(service.id, service.name_ku)}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
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
              <h2>{editingService ? t('edit') : t('add')} {t('service')}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('service')} (کوردی) *</label>
                  <input
                    type="text"
                    value={formData.name_ku}
                    onChange={(e) => setFormData({ ...formData, name_ku: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('service')} (عەرەبی) *</label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('price')} * (IQD)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('duration')} ({t('minutes')})</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    min="5"
                    step="5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('description')} (کوردی)</label>
                <textarea
                  value={formData.description_ku}
                  onChange={(e) => setFormData({ ...formData, description_ku: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>{t('description')} (عەرەبی)</label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows="2"
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

export default Services;