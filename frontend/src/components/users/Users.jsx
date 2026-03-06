// کۆمپۆنەنتی بەکارهێنەران (Admin Only)
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllUsers, addUser, updateUser, deleteUser, resetUserPassword } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import Alert from '../common/Alert';
import '../../styles/components/Users.css';

const Users = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'employee',
    language: 'ku'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`${t('delete_confirm')}\n${username}`)) return;

    try {
      await deleteUser(id);
      setAlert({ type: 'success', message: t('delete_success') });
      fetchUsers();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        full_name: user.full_name,
        role: user.role,
        language: user.language
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'employee',
        language: 'ku'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const openPasswordModal = (userId) => {
    setResetPasswordUserId(userId);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setResetPasswordUserId(null);
    setNewPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingUser && !formData.password) {
      setAlert({ type: 'error', message: 'تکایە وشەی نهێنی بنووسە' });
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      setAlert({ type: 'success', message: t('save_success') });
      closeModal();
      fetchUsers();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 4) {
      setAlert({ type: 'error', message: 'وشەی نهێنی دەبێت لانیکەم ٤ پیت بێت' });
      return;
    }

    try {
      await resetUserPassword(resetPasswordUserId, newPassword);
      setAlert({ type: 'success', message: 'وشەی نهێنی بە سەرکەوتوویی ڕێسێت کرا' });
      closePasswordModal();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>{t('menu_users')}</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          ➕ {t('add_user')}
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('username')}</th>
              <th>{t('full_name')}</th>
              <th>{t('role')}</th>
              <th>زمان</th>
              <th>{t('status')}</th>
              <th>بەرواری دروستکردن</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.full_name}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                    {user.role === 'admin' ? t('role_admin') : t('role_employee')}
                  </span>
                </td>
                <td>{user.language === 'ku' ? 'کوردی' : 'عەرەبی'}</td>
                <td>
                  <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {user.is_active ? t('active') : t('inactive')}
                  </span>
                </td>
                <td>{formatDateTime(user.created_at)}</td>
                <td className="actions-cell">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => openModal(user)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => openPasswordModal(user.id)}
                    title="ڕێسێتی وشەی نهێنی"
                  >
                    🔑
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(user.id, user.username)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مۆداڵی زیادکردن/دەستکاری */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? t('edit') : t('add')} {t('menu_users')}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('username')} *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={editingUser}
                />
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label>{t('password')} *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength="4"
                  />
                </div>
              )}

              <div className="form-group">
                <label>{t('full_name')} *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('role')} *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="employee">{t('role_employee')}</option>
                    <option value="admin">{t('role_admin')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>زمان *</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                  >
                    <option value="ku">کوردی</option>
                    <option value="ar">عەرەبی</option>
                  </select>
                </div>
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

      {/* مۆداڵی ڕێسێتی وشەی نهێنی */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ڕێسێتی وشەی نهێنی</h2>
              <button className="modal-close" onClick={closePasswordModal}>✕</button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>وشەی نهێنی نوێ *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="4"
                  placeholder="لانیکەم ٤ پیت"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closePasswordModal}>
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

export default Users;