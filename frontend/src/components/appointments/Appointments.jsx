// کۆمپۆنەنتی چاوپێکەوتنەکان
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllAppointments, createAppointment, updateAppointmentStatus, deleteAppointment, getAllCustomers, getAllServices } from '../../services/api';
import { formatDate, formatTime, getTodayDate, getCurrentTime } from '../../utils/helpers';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import Alert from '../common/Alert';
import '../../styles/components/Appointments.css';

const Appointments = () => {
  const { t, language } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState(getTodayDate());
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    appointment_date: getTodayDate(),
    appointment_time: getCurrentTime(),
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

  const fetchData = async () => {
    try {
      const [customersRes, servicesRes] = await Promise.all([
        getAllCustomers(),
        getAllServices({ active: 'true' })
      ]);
      setCustomers(customersRes.data.data);
      setServices(servicesRes.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;

      const response = await getAllAppointments(params);
      setAppointments(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      setAlert({ type: 'success', message: 'دۆخ بە سەرکەوتوویی نوێکرایەوە' });
      fetchAppointments();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;

    try {
      await deleteAppointment(id);
      setAlert({ type: 'success', message: t('delete_success') });
      fetchAppointments();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const openModal = () => {
    setFormData({
      customer_id: '',
      service_id: '',
      appointment_date: getTodayDate(),
      appointment_time: getCurrentTime(),
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.service_id || !formData.appointment_date || !formData.appointment_time) {
      setAlert({ type: 'error', message: 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە' });
      return;
    }

    try {
      await createAppointment(formData);
      setAlert({ type: 'success', message: 'چاوپێکەوتن بە سەرکەوتوویی حەجزکرا' });
      closeModal();
      fetchAppointments();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [APPOINTMENT_STATUS.PENDING]: { class: 'badge-warning', text: t('appointment_status_pending') },
      [APPOINTMENT_STATUS.CONFIRMED]: { class: 'badge-info', text: t('appointment_status_confirmed') },
      [APPOINTMENT_STATUS.COMPLETED]: { class: 'badge-success', text: t('appointment_status_completed') },
      [APPOINTMENT_STATUS.CANCELLED]: { class: 'badge-danger', text: t('appointment_status_cancelled') }
    };

    const config = statusConfig[status] || statusConfig[APPOINTMENT_STATUS.PENDING];
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>{t('menu_appointments')}</h1>
        <button className="btn btn-primary" onClick={openModal}>
          ➕ {t('add_appointment')}
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="page-filters">
        <div className="filter-group">
          <label>{t('date')}:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>{t('status')}:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-input">
            <option value="">هەموو</option>
            <option value={APPOINTMENT_STATUS.PENDING}>{t('appointment_status_pending')}</option>
            <option value={APPOINTMENT_STATUS.CONFIRMED}>{t('appointment_status_confirmed')}</option>
            <option value={APPOINTMENT_STATUS.COMPLETED}>{t('appointment_status_completed')}</option>
            <option value={APPOINTMENT_STATUS.CANCELLED}>{t('appointment_status_cancelled')}</option>
          </select>
        </div>

        <button className="btn btn-secondary" onClick={() => { setFilterDate(getTodayDate()); setFilterStatus(''); }}>
          🔄 ڕێسێت
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('customer_name')}</th>
              <th>{t('phone')}</th>
              <th>{t('service')}</th>
              <th>{t('appointment_date')}</th>
              <th>{t('appointment_time')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  هیچ چاوپێکەوتنێک نەدۆزرایەوە
                </td>
              </tr>
            ) : (
              appointments.map((appointment, index) => (
                <tr key={appointment.id}>
                  <td>{index + 1}</td>
                  <td>{appointment.customer_name}</td>
                  <td>{appointment.customer_phone}</td>
                  <td>{appointment.service_name}</td>
                  <td>{formatDate(appointment.appointment_date)}</td>
                  <td>{formatTime(appointment.appointment_time)}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td className="actions-cell">
                    {appointment.status === APPOINTMENT_STATUS.PENDING && (
                      <>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleStatusChange(appointment.id, APPOINTMENT_STATUS.CONFIRMED)}
                          title="دڵنیاکردنەوە"
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusChange(appointment.id, APPOINTMENT_STATUS.CANCELLED)}
                          title="هەڵوەشاندنەوە"
                        >
                          ✕
                        </button>
                      </>
                    )}
                    {appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleStatusChange(appointment.id, APPOINTMENT_STATUS.COMPLETED)}
                        title="تەواوکردن"
                      >
                        ✓✓
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(appointment.id)}
                      title="سڕینەوە"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مۆداڵی حەجزکردنی چاوپێکەوتن */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('add_appointment')}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('select_customer')} *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                >
                  <option value="">هەڵبژێرە...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('select_service')} *</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  required
                >
                  <option value="">هەڵبژێرە...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {language === 'ku' ? service.name_ku : service.name_ar} - {service.duration} {t('minutes')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('appointment_date')} *</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    min={getTodayDate()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('appointment_time')} *</label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                  />
                </div>
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

export default Appointments;