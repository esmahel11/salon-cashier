import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Alert from '../common/Alert';
import '../../styles/components/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    setLoading(true);
    
    const result = await login(credentials);
    
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">{t('app_name')}</h1>
          <LanguageSwitcher />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{t('login_title')}</h2>

          {error && <Alert type="error" message={error} />}

          <div className="form-group">
            <label>{t('username')}</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder={t('username')}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder={t('password')}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? t('loading') : t('login_button')}
          </button>
        </form>

        <div className="login-footer">
          <p>ناوی بەکارهێنەر: admin</p>
          <p>وشەی نهێنی: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;