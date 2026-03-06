// کۆنتڕۆڵەری ڕاپۆرتەکان
const db = require('../config/database');

// ڕاپۆرتی گشتی داشبۆرد
exports.getDashboardStats = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    // ئامارەکانی ئەمڕۆ
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as revenue,
        COALESCE(SUM(subtotal - total), 0) as discount
      FROM sales
      WHERE DATE(created_at) = ?
    `).get(today);

    // ئامارەکانی ئەم مانگە
    const monthStats = db.prepare(`
      SELECT 
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as revenue
      FROM sales
      WHERE strftime('%Y-%m', created_at) = ?
    `).get(thisMonth);

    // ژمارەی کڕیارەکان
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();

    // مادە کەمەکان
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock AND is_active = 1').get();

    // چاوپێکەوتنەکانی ئەمڕۆ
    const todayAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointment_date = ? AND status != 'cancelled'
    `).get(today);

    // کۆی خەرجیەکانی ئەمڕۆ
    const todayExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
      WHERE expense_date = ?
    `).get(today);

    res.json({
      success: true,
      data: {
        today: {
          sales_count: todayStats.sales_count,
          revenue: todayStats.revenue,
          discount: todayStats.discount,
          expenses: todayExpenses.total,
          profit: todayStats.revenue - todayExpenses.total,
          appointments: todayAppointments.count
        },
        month: {
          sales_count: monthStats.sales_count,
          revenue: monthStats.revenue
        },
        general: {
          customers: customerCount.count,
          low_stock_items: lowStockCount.count
        }
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی ئامارەکانی داشبۆرد:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕاپۆرتی فرۆشتن
exports.getSalesReport = (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    let query = '';
    const params = [];

    if (groupBy === 'day') {
      query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as sales_count,
          SUM(subtotal) as subtotal,
          SUM(subtotal - total) as discount,
          SUM(total) as revenue
        FROM sales
        WHERE 1=1
      `;
    } else if (groupBy === 'month') {
      query = `
        SELECT 
          strftime('%Y-%m', created_at) as date,
          COUNT(*) as sales_count,
          SUM(subtotal) as subtotal,
          SUM(subtotal - total) as discount,
          SUM(total) as revenue
        FROM sales
        WHERE 1=1
      `;
    } else {
      query = `
        SELECT 
          COUNT(*) as sales_count,
          SUM(subtotal) as subtotal,
          SUM(subtotal - total) as discount,
          SUM(total) as revenue
        FROM sales
        WHERE 1=1
      `;
    }

    // فلتەری بەروار
    if (startDate) {
      query += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    if (groupBy) {
      query += ' GROUP BY date ORDER BY date DESC';
    }

    const report = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: groupBy ? report : report[0] || { sales_count: 0, subtotal: 0, discount: 0, revenue: 0 }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی ڕاپۆرتی فرۆشتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕاپۆرتی قازانج و زەرەر
exports.getProfitLossReport = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let params = [];

    // وەرگرتنی کۆی داهات
    let revenueQuery = 'SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE 1=1';
    if (startDate) {
      revenueQuery += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      revenueQuery += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }
    const revenue = db.prepare(revenueQuery).get(...params);

    // وەرگرتنی کۆی خەرجیەکان
    params = [];
    let expenseQuery = 'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE 1=1';
    if (startDate) {
      expenseQuery += ' AND expense_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      expenseQuery += ' AND expense_date <= ?';
      params.push(endDate);
    }
    const expenses = db.prepare(expenseQuery).get(...params);

    // حیسابکردنی تێچووی کڕین (لە مادە فرۆشراوەکان)
    params = [];
    let costQuery = `
      SELECT COALESCE(SUM(si.quantity * p.buy_price), 0) as total
      FROM sale_items si
      JOIN products p ON si.item_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE si.item_type = 'product'
    `;
    if (startDate) {
      costQuery += ' AND DATE(s.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      costQuery += ' AND DATE(s.created_at) <= ?';
      params.push(endDate);
    }
    const productCost = db.prepare(costQuery).get(...params);

    // حیسابکردنی قازانج
    const totalRevenue = revenue.total || 0;
    const totalExpenses = expenses.total || 0;
    const totalCost = productCost.total || 0;
    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      success: true,
      data: {
        revenue: totalRevenue,
        product_cost: totalCost,
        gross_profit: grossProfit,
        expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی ڕاپۆرتی قازانج و زەرەر:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕاپۆرتی بەرهەمە باشەکان
exports.getTopSellingProducts = (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    let query = `
      SELECT 
        si.item_id,
        si.item_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.total) as total_revenue,
        COUNT(DISTINCT si.sale_id) as sales_count
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE si.item_type = 'product'
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(s.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(s.created_at) <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY si.item_id ORDER BY total_quantity DESC LIMIT ?';
    params.push(parseInt(limit));

    const products = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی بەرهەمە باشەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕاپۆرتی خزمەتگوزاری باشەکان
exports.getTopServices = (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    let query = `
      SELECT 
        si.item_id,
        si.item_name,
        SUM(si.quantity) as total_count,
        SUM(si.total) as total_revenue,
        COUNT(DISTINCT si.sale_id) as sales_count
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE si.item_type = 'service'
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(s.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(s.created_at) <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY si.item_id ORDER BY total_count DESC LIMIT ?';
    params.push(parseInt(limit));

    const services = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی خزمەتگوزاری باشەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕاپۆرتی کڕیارەکان
exports.getCustomerReport = (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topCustomers = db.prepare(`
      SELECT * FROM customers 
      ORDER BY total_purchases DESC 
      LIMIT ?
    `).all(parseInt(limit));

    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    const activeCustomers = db.prepare('SELECT COUNT(*) as count FROM customers WHERE visit_count > 0').get();

    res.json({
      success: true,
      data: {
        total_customers: totalCustomers.count,
        active_customers: activeCustomers.count,
        top_customers: topCustomers
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی ڕاپۆرتی کڕیارەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕاپۆرتی کۆگا
exports.getInventoryReport = (req, res) => {
  try {
    // بەرهەمە کەمەکان
    const lowStock = db.prepare(`
      SELECT * FROM products 
      WHERE quantity <= min_stock AND is_active = 1
      ORDER BY quantity ASC
    `).all();

    // کۆی نرخی کۆگا
    const inventoryValue = db.prepare(`
      SELECT 
        COALESCE(SUM(quantity * buy_price), 0) as total_cost,
        COALESCE(SUM(quantity * sell_price), 0) as potential_revenue,
        COUNT(*) as total_products
      FROM products
      WHERE is_active = 1
    `).get();

    res.json({
      success: true,
      data: {
        low_stock_items: lowStock,
        inventory_value: inventoryValue
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی ڕاپۆرتی کۆگا:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};