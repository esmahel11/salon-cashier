// کۆمپۆنەنتی فرۆشتن
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllProducts, getAllServices, getAllCustomers, createSale } from '../../services/api';
import { formatCurrency, calculateDiscount } from '../../utils/helpers';
import { DISCOUNT_TYPES } from '../../utils/constants';
import Alert from '../common/Alert';
import Receipt from './Receipt';
import { useReactToPrint } from 'react-to-print';
import '../../styles/components/Sales.css';

const Sales = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const receiptRef = useRef();

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [discountType, setDiscountType] = useState(DISCOUNT_TYPES.NONE);
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saleData, setSaleData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, servicesRes, customersRes] = await Promise.all([
        getAllProducts({ active: 'true' }),
        getAllServices({ active: 'true' }),
        getAllCustomers()
      ]);

      setProducts(productsRes.data.data);
      setServices(servicesRes.data.data);
      setCustomers(customersRes.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: t('error_occurred') });
    }
  };

  const addToCart = (item, type) => {
    const existingItem = cart.find(
      cartItem => cartItem.item_id === item.id && cartItem.item_type === type
    );

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.item_id === item.id && cartItem.item_type === type
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const price = type === 'product' ? item.sell_price : item.price;
      setCart([
        ...cart,
        {
          item_type: type,
          item_id: item.id,
          item_name: language === 'ku' ? item.name_ku : item.name_ar,
          quantity: 1,
          price: price
        }
      ]);
    }
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal, discountType, discountValue);
    return subtotal - discount;
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setAlert({ type: 'error', message: 'تکایە بەلایەنی کەم یەک بەرهەم یان خزمەتگوزاری هەڵبژێرە' });
      return;
    }

    try {
      setLoading(true);
      const response = await createSale({
        customer_id: selectedCustomer || null,
        items: cart,
        discount_type: discountType,
        discount_value: discountValue,
        payment_method: paymentMethod,
        notes: notes
      });

      const customerData = customers.find(c => c.id === parseInt(selectedCustomer));
      
      setSaleData({
        ...response.data.data,
        items: cart,
        customer: customerData,
        user: user,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(calculateSubtotal(), discountType, discountValue),
        payment_method: paymentMethod,
        notes: notes
      });

      setAlert({ type: 'success', message: t('save_success') });
      
      // ڕێسێت کردنی فۆڕم
      setCart([]);
      setSelectedCustomer('');
      setDiscountType(DISCOUNT_TYPES.NONE);
      setDiscountValue(0);
      setNotes('');
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || t('error_occurred') });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => setSaleData(null)
  });

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>{t('new_sale')}</h1>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="sales-container">
        {/* بەشی هەڵبژاردنی بەرهەم و خزمەتگوزاری */}
        <div className="sales-left">
          <div className="products-section">
            <h3>📦 {t('select_product')}</h3>
            <div className="items-grid">
              {products.map(product => (
                <div key={product.id} className="item-card" onClick={() => addToCart(product, 'product')}>
                  <div className="item-name">{language === 'ku' ? product.name_ku : product.name_ar}</div>
                  <div className="item-price">{formatCurrency(product.sell_price)} IQD</div>
                  <div className="item-stock">{t('quantity')}: {product.quantity}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="services-section">
            <h3>✂️ {t('select_service')}</h3>
            <div className="items-grid">
              {services.map(service => (
                <div key={service.id} className="item-card" onClick={() => addToCart(service, 'service')}>
                  <div className="item-name">{language === 'ku' ? service.name_ku : service.name_ar}</div>
                  <div className="item-price">{formatCurrency(service.price)} IQD</div>
                  <div className="item-duration">{service.duration} {t('minutes')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* بەشی سەبەتە */}
        <div className="sales-right">
          <div className="cart-section">
            <h3>🛒 {t('cart')}</h3>

            <div className="form-group">
              <label>{t('select_customer')}</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                <option value="">بێ کڕیار</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">سەبەتە بەتاڵە</div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.item_name}</div>
                      <div className="cart-item-price">{formatCurrency(item.price)} IQD</div>
                    </div>
                    <div className="cart-item-actions">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                        min="1"
                        className="quantity-input"
                      />
                      <button className="btn-remove" onClick={() => removeFromCart(index)}>🗑️</button>
                    </div>
                    <div className="cart-item-total">
                      {formatCurrency(item.price * item.quantity)} IQD
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>{t('subtotal')}:</span>
                <span>{formatCurrency(calculateSubtotal())} IQD</span>
              </div>

              <div className="form-group">
                <label>{t('discount')}</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <option value={DISCOUNT_TYPES.NONE}>بێ داشکاندن</option>
                  <option value={DISCOUNT_TYPES.PERCENTAGE}>{t('discount_percentage')}</option>
                  <option value={DISCOUNT_TYPES.FIXED}>{t('discount_fixed')}</option>
                </select>
              </div>

              {discountType !== DISCOUNT_TYPES.NONE && (
                <div className="form-group">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    min="0"
                    placeholder={discountType === DISCOUNT_TYPES.PERCENTAGE ? 'لەسەدا' : 'بڕ'}
                  />
                </div>
              )}

              {discountType !== DISCOUNT_TYPES.NONE && (
                <div className="summary-row">
                  <span>{t('discount')}:</span>
                  <span className="text-danger">
                    -{formatCurrency(calculateDiscount(calculateSubtotal(), discountType, discountValue))} IQD
                  </span>
                </div>
              )}

              <div className="summary-row total-row">
                <span>{t('total')}:</span>
                <span>{formatCurrency(calculateTotal())} IQD</span>
              </div>

              <div className="form-group">
                <label>{t('payment_method')}</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">{t('cash')}</option>
                  <option value="card">{t('card')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('notes')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                />
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={handleCompleteSale}
                disabled={loading || cart.length === 0}
              >
                {loading ? t('loading') : `💰 ${t('complete_sale')}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* بەشی پرینتی پسوڵە */}
      {saleData && (
        <div className="receipt-modal">
          <div className="receipt-modal-content">
            <Receipt ref={receiptRef} data={saleData} />
            <div className="receipt-actions">
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨️ {t('print_receipt')}
              </button>
              <button className="btn btn-secondary" onClick={() => setSaleData(null)}>
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;