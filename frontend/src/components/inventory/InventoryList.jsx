// کۆمپۆنەنتی لیستی کۆگا
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllProducts, deleteProduct } from '../../services/api';
import { formatCurrency, isAdmin } from '../../utils/helpers';
import SearchBar from '../common/SearchBar';
import Alert from '../common/Alert';
import '../../styles/components/Inventory.css';

const InventoryList = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      setProducts(response.data.data);
      setAlert(null);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name_ku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
    );
    setFilteredProducts(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t('delete_confirm')}\n${name}`)) {
      return;
    }

    try {
      await deleteProduct(id);
      setAlert({ type: 'success', message: t('delete_success') });
      fetchProducts();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>{t('menu_inventory')}</h1>
        {isAdmin(user) && (
          <button className="btn btn-primary" onClick={() => navigate('/inventory/add')}>
            ➕ {t('add_product')}
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
              <th>{t('product_name')}</th>
              <th>{t('barcode')}</th>
              <th>{t('category')}</th>
              <th>{t('quantity')}</th>
              <th>{t('buy_price')}</th>
              <th>{t('sell_price')}</th>
              <th>{t('status')}</th>
              {isAdmin(user) && <th>{t('actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">
                  هیچ مادەیەک نەدۆزرایەوە
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr key={product.id} className={product.quantity <= product.min_stock ? 'low-stock-row' : ''}>
                  <td>{index + 1}</td>
                  <td>{language === 'ku' ? product.name_ku : product.name_ar}</td>
                  <td>{product.barcode || '-'}</td>
                  <td>{language === 'ku' ? product.category_ku : product.category_ar || '-'}</td>
                  <td>
                    <span className={product.quantity <= product.min_stock ? 'text-danger' : ''}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>{formatCurrency(product.buy_price)} IQD</td>
                  <td>{formatCurrency(product.sell_price)} IQD</td>
                  <td>
                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {product.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  {isAdmin(user) && (
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/inventory/edit/${product.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product.id, product.name_ku)}
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
    </div>
  );
};

export default InventoryList;