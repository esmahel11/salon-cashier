// کۆمپۆنەنتی پسوڵە
import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import '../../styles/components/Receipt.css';

const Receipt = React.forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} className="receipt">
      <div className="receipt-header">
        <h2>سیستەمی کاشێری ئارایشتگا</h2>
        <p>Beauty Salon System</p>
      </div>

      <div className="receipt-info">
        <div className="receipt-row">
          <span>ژمارەی پسوڵە:</span>
          <span>{data.invoice_number}</span>
        </div>
        <div className="receipt-row">
          <span>بەروار و کات:</span>
          <span>{formatDateTime(new Date())}</span>
        </div>
        {data.customer && (
          <>
            <div className="receipt-row">
              <span>کڕیار:</span>
              <span>{data.customer.name}</span>
            </div>
            <div className="receipt-row">
              <span>مۆبایل:</span>
              <span>{data.customer.phone}</span>
            </div>
          </>
        )}
        <div className="receipt-row">
          <span>کارمەند:</span>
          <span>{data.user.full_name}</span>
        </div>
      </div>

      <div className="receipt-divider"></div>

      <table className="receipt-table">
        <thead>
          <tr>
            <th>بەرهەم/خزمەتگوزاری</th>
            <th>بڕ</th>
            <th>نرخ</th>
            <th>کۆ</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{item.item_name}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-divider"></div>

      <div className="receipt-summary">
        <div className="receipt-row">
          <span>کۆی سەرەتایی:</span>
          <span>{formatCurrency(data.subtotal)} IQD</span>
        </div>
        {data.discount > 0 && (
          <div className="receipt-row">
            <span>داشکاندن:</span>
            <span className="text-danger">-{formatCurrency(data.discount)} IQD</span>
          </div>
        )}
        <div className="receipt-row total-row">
          <span>کۆی گشتی:</span>
          <span>{formatCurrency(data.total)} IQD</span>
        </div>
        <div className="receipt-row">
          <span>شێوازی پارەدان:</span>
          <span>{data.payment_method === 'cash' ? 'نەقد' : 'کارت'}</span>
        </div>
      </div>

      {data.notes && (
        <>
          <div className="receipt-divider"></div>
          <div className="receipt-notes">
            <strong>تێبینی:</strong> {data.notes}
          </div>
        </>
      )}

      <div className="receipt-footer">
        <p>سوپاس بۆ هاتنتان</p>
        <p>Thank You</p>
      </div>
    </div>
  );
});

export default Receipt;