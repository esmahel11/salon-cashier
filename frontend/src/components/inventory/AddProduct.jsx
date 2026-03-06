// کۆمپۆنەنتی زیادکردنی مادە
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { addProduct } from '../../services/api';
import Alert from '../common/Alert';
import '../../styles/components/Form.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name_ku: '',
    name_ar: '',
    barcode: '',
    quantity: 0,
    buy_price: '',
    sell_price: '',
    min_stock: 10,
    category_ku: '',
    category_ar: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name_ku || !formData.name_ar || !formData.buy_price || !formData.sell_price) {
      setAlert({ type: 'error', message: 'تکایە خانە پێویستەکان پڕ بکەرەوە' });
      return;
    }

    try {
      setLoading(true);
      await addProduct(formData);
      setAlert({ type: 'success', message: t('save_success') });
      setTimeout(() => navigate('/inventory'), 1500);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{t('add_product')}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
          ← {t('cancel')}
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>{t('product_name_ku')} *</label>
            <input
              type="text"
              name="name_ku"
              value={formData.name_ku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('product_name_ar')} *</label>
            <input
              type="text"
              name="name_ar"
              value={formData.name_ar}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('barcode')}</label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('quantity')}</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('buy_price')} * (IQD)</label>
            <input
              type="number"
              name="buy_price"
              value={formData.buy_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>{t('sell_price')} * (IQD)</label>
            <input
              type="number"
              name="sell_price"
              value={formData.sell_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('min_stock')}</label>
            <input
              type="number"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>{t('category')} (کوردی)</label>
            <input
              type="text"
              name="category_ku"
              value={formData.category_ku}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('category')} (عەرەبی)</label>
            <input
              type="text"
              name="category_ar"
              value={formData.category_ar}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t('description')}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') : t('save')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventory')}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;