// پەیوەندی بە داتابەیسی SQLite
const Database = require('better-sqlite3');
const path = require('path');

// دروستکردنی پەیوەندی بە داتابەیس
const dbPath = path.join(__dirname, '../../../database/salon.db');
const db = new Database(dbPath, { verbose: console.log });

// دروستکردنی تەبلەکان
const createTables = () => {
  // تەبلی بەکارهێنەران
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
      language TEXT DEFAULT 'ku' CHECK(language IN ('ku', 'ar')),
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // تەبلی مادەکان
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ku TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      barcode TEXT UNIQUE,
      quantity INTEGER DEFAULT 0,
      buy_price REAL NOT NULL,
      sell_price REAL NOT NULL,
      min_stock INTEGER DEFAULT 10,
      category_ku TEXT,
      category_ar TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // تەبلی خزمەتگوزارییەکان
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ku TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      price REAL NOT NULL,
      duration INTEGER DEFAULT 30,
      description_ku TEXT,
      description_ar TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // تەبلی کڕیارەکان
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      address TEXT,
      notes TEXT,
      total_purchases REAL DEFAULT 0,
      visit_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // تەبلی فرۆشتنەکان
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      user_id INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed', 'none')),
      discount_value REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // تەبلی بڕگەکانی فرۆشتن
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      item_type TEXT CHECK(item_type IN ('product', 'service')),
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    )
  `);

  // تەبلی چاوپێکەوتنەکان
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // تەبلی خەرجییەکان
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_ku TEXT NOT NULL,
      category_ar TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date DATE NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ هەموو تەبلەکان بە سەرکەوتوویی دروست کران');
};

// جێبەجێکردنی دروستکردنی تەبلەکان
createTables();

// دروستکردنی بەکارهێنەری سەرەتایی (admin)
const bcrypt = require('bcryptjs');
const initAdmin = () => {
  const checkAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  
  if (!checkAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, password, full_name, role, language)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', hashedPassword, 'بەڕێوەبەری سیستەم', 'admin', 'ku');
    
    console.log('✅ بەکارهێنەری admin دروست کرا');
    console.log('📝 ناوی بەکارهێنەر: admin');
    console.log('📝 وشەی نهێنی: admin123');
  }
};

initAdmin();

module.exports = db;