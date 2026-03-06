// ثابتەکان و دەقەکان

// لینکی API
export const API_BASE_URL = 'https://28d66cdf-5137-4ed6-bc1d-a997c82e7851-00-2fi7bdhflshwj.sisko.replit.dev';

// دەقەکانی کوردی
export const TEXTS_KU = {
  // گشتی
  app_name: 'سیستەمی کاشێری ئارایشتگا',
  welcome: 'بەخێربێیت',
  loading: 'چاوەڕوان بە...',
  save: 'پاشەکەوتکردن',
  cancel: 'پاشگەزبوونەوە',
  delete: 'سڕینەوە',
  edit: 'دەستکاریکردن',
  add: 'زیادکردن',
  search: 'گەڕان...',
  close: 'داخستن',
  confirm: 'دڵنیابوونەوە',
  yes: 'بەڵێ',
  no: 'نەخێر',
  total: 'کۆی گشتی',
  date: 'بەروار',
  time: 'کات',
  status: 'دۆخ',
  actions: 'کردارەکان',
  
  // مینیۆ
  menu_dashboard: 'داشبۆرد',
  menu_sales: 'فرۆشتن',
  menu_inventory: 'کۆگای مادەکان',
  menu_services: 'خزمەتگوزارییەکان',
  menu_customers: 'کڕیارەکان',
  menu_appointments: 'چاوپێکەوتنەکان',
  menu_expenses: 'خەرجییەکان',
  menu_reports: 'ڕاپۆرتەکان',
  menu_users: 'بەکارهێنەران',
  menu_settings: 'ڕێکخستنەکان',
  menu_logout: 'دەرچوون',
  
  // چوونەژوورەوە
  login_title: 'چوونەژوورەوە',
  username: 'ناوی بەکارهێنەر',
  password: 'وشەی نهێنی',
  login_button: 'چوونەژوورەوە',
  login_error: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە',
  
  // داشبۆرد
  today_sales: 'فرۆشتنی ئەمڕۆ',
  today_revenue: 'داهاتی ئەمڕۆ',
  today_expenses: 'خەرجیی ئەمڕۆ',
  today_profit: 'قازانجی ئەمڕۆ',
  total_customers: 'کۆی کڕیارەکان',
  low_stock_alert: 'ئاگاداری کۆگای کەم',
  today_appointments: 'چاوپێکەوتنی ئەمڕۆ',
  
  // کۆگای مادەکان
  product_name: 'ناوی مادە',
  product_name_ku: 'ناوی مادە (کوردی)',
  product_name_ar: 'ناوی مادە (عەرەبی)',
  barcode: 'بارکۆد',
  quantity: 'بڕ',
  buy_price: 'نرخی کڕین',
  sell_price: 'نرخی فرۆشتن',
  min_stock: 'کەمترین بڕ',
  category: 'پۆل',
  description: 'وەسف',
  add_product: 'زیادکردنی مادە',
  edit_product: 'دەستکاریی مادە',
  delete_product: 'سڕینەوەی مادە',
  
  // فرۆشتن
  new_sale: 'فرۆشتنی نوێ',
  select_customer: 'هەڵبژاردنی کڕیار',
  select_product: 'هەڵبژاردنی بەرهەم',
  select_service: 'هەڵبژاردنی خزمەتگوزاری',
  add_to_cart: 'زیادکردن بۆ سەبەتە',
  cart: 'سەبەتە',
  subtotal: 'کۆی سەرەتایی',
  discount: 'داشکاندن',
  discount_percentage: 'داشکاندن (%)',
  discount_fixed: 'داشکاندن (بڕی دیاریکراو)',
  payment_method: 'شێوازی پارەدان',
  cash: 'نەقد',
  card: 'کارت',
  complete_sale: 'تەواوکردنی فرۆشتن',
  print_receipt: 'پرینتی پسوڵە',
  
  // کڕیارەکان
  customer_name: 'ناوی کڕیار',
  phone: 'ژمارەی مۆبایل',
  email: 'ئیمەیڵ',
  address: 'ناونیشان',
  notes: 'تێبینییەکان',
  total_purchases: 'کۆی کڕین',
  visit_count: 'ژمارەی سەردان',
  add_customer: 'زیادکردنی کڕیار',
  
  // چاوپێکەوتنەکان
  appointment_date: 'بەرواری چاوپێکەوتن',
  appointment_time: 'کاتی چاوپێکەوتن',
  service: 'خزمەتگوزاری',
  appointment_status_pending: 'چاوەڕوان',
  appointment_status_confirmed: 'دڵنیاکراوە',
  appointment_status_completed: 'تەواوبووە',
  appointment_status_cancelled: 'هەڵوەشاوەتەوە',
  add_appointment: 'حەجزکردنی چاوپێکەوتن',
  
  // خەرجییەکان
  expense_category: 'پۆلی خەرجی',
  expense_description: 'وەسفی خەرجی',
  amount: 'بڕ',
  expense_date: 'بەرواری خەرجی',
  add_expense: 'زیادکردنی خەرجی',
  
  // ڕاپۆرتەکان
  sales_report: 'ڕاپۆرتی فرۆشتن',
  profit_loss_report: 'ڕاپۆرتی قازانج و زەرەر',
  inventory_report: 'ڕاپۆرتی کۆگا',
  customer_report: 'ڕاپۆرتی کڕیارەکان',
  date_from: 'لە بەرواری',
  date_to: 'بۆ بەرواری',
  generate_report: 'دروستکردنی ڕاپۆرت',
  
  // بەکارهێنەران
  full_name: 'ناوی تەواو',
  role: 'ڕۆڵ',
  role_admin: 'بەڕێوەبەر',
  role_employee: 'کارمەند',
  add_user: 'زیادکردنی بەکارهێنەر',
  change_password: 'گۆڕینی وشەی نهێنی',
  
  // پەیامەکان
  success: 'سەرکەوتوو',
  error: 'هەڵە',
  delete_confirm: 'دڵنیایت لە سڕینەوە؟',
  save_success: 'بە سەرکەوتوویی پاشەکەوت کرا',
  delete_success: 'بە سەرکەوتوویی سڕایەوە',
  error_occurred: 'هەڵەیەک ڕوویدا',
  
  // دیکە
  active: 'چالاک',
  inactive: 'ناچالاک',
  price: 'نرخ',
  duration: 'ماوە',
  minutes: 'خولەک'
};

// دەقەکانی عەرەبی
export const TEXTS_AR = {
  // گشتی
  app_name: 'نظام الكاشير لصالون التجميل',
  welcome: 'مرحبا',
  loading: 'جاري التحميل...',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  add: 'إضافة',
  search: 'بحث...',
  close: 'إغلاق',
  confirm: 'تأكيد',
  yes: 'نعم',
  no: 'لا',
  total: 'المجموع',
  date: 'التاريخ',
  time: 'الوقت',
  status: 'الحالة',
  actions: 'الإجراءات',
  
  // مینیۆ
  menu_dashboard: 'لوحة التحكم',
  menu_sales: 'المبيعات',
  menu_inventory: 'المخزون',
  menu_services: 'الخدمات',
  menu_customers: 'العملاء',
  menu_appointments: 'المواعيد',
  menu_expenses: 'المصروفات',
  menu_reports: 'التقارير',
  menu_users: 'المستخدمين',
  menu_settings: 'الإعدادات',
  menu_logout: 'تسجيل خروج',
  
  // چوونەژوورەوە
  login_title: 'تسجيل الدخول',
  username: 'اسم المستخدم',
  password: 'كلمة المرور',
  login_button: 'دخول',
  login_error: 'اسم المستخدم أو كلمة المرور خاطئة',
  
  // داشبۆرد
  today_sales: 'مبيعات اليوم',
  today_revenue: 'إيرادات اليوم',
  today_expenses: 'مصروفات اليوم',
  today_profit: 'ربح اليوم',
  total_customers: 'إجمالي العملاء',
  low_stock_alert: 'تنبيه المخزون المنخفض',
  today_appointments: 'مواعيد اليوم',
  
  // کۆگای مادەکان
  product_name: 'اسم المنتج',
  product_name_ku: 'اسم المنتج (كردي)',
  product_name_ar: 'اسم المنتج (عربي)',
  barcode: 'الباركود',
  quantity: 'الكمية',
  buy_price: 'سعر الشراء',
  sell_price: 'سعر البيع',
  min_stock: 'الحد الأدنى',
  category: 'الفئة',
  description: 'الوصف',
  add_product: 'إضافة منتج',
  edit_product: 'تعديل منتج',
  delete_product: 'حذف منتج',
  
  // فرۆشتن
  new_sale: 'بيع جديد',
  select_customer: 'اختر العميل',
  select_product: 'اختر المنتج',
  select_service: 'اختر الخدمة',
  add_to_cart: 'أضف للسلة',
  cart: 'السلة',
  subtotal: 'المجموع الفرعي',
  discount: 'الخصم',
  discount_percentage: 'خصم (%)',
  discount_fixed: 'خصم (مبلغ محدد)',
  payment_method: 'طريقة الدفع',
  cash: 'نقدي',
  card: 'بطاقة',
  complete_sale: 'إتمام البيع',
  print_receipt: 'طباعة الفاتورة',
  
  // کڕیارەکان
  customer_name: 'اسم العميل',
  phone: 'رقم الهاتف',
  email: 'البريد الإلكتروني',
  address: 'العنوان',
  notes: 'ملاحظات',
  total_purchases: 'إجمالي المشتريات',
  visit_count: 'عدد الزيارات',
  add_customer: 'إضافة عميل',
  
  // چاوپێکەوتنەکان
  appointment_date: 'تاريخ الموعد',
  appointment_time: 'وقت الموعد',
  service: 'الخدمة',
  appointment_status_pending: 'قيد الانتظار',
  appointment_status_confirmed: 'مؤكد',
  appointment_status_completed: 'مكتمل',
  appointment_status_cancelled: 'ملغي',
  add_appointment: 'حجز موعد',
  
  // خەرجییەکان
  expense_category: 'فئة المصروف',
  expense_description: 'وصف المصروف',
  amount: 'المبلغ',
  expense_date: 'تاريخ المصروف',
  add_expense: 'إضافة مصروف',
  
  // ڕاپۆرتەکان
  sales_report: 'تقرير المبيعات',
  profit_loss_report: 'تقرير الأرباح والخسائر',
  inventory_report: 'تقرير المخزون',
  customer_report: 'تقرير العملاء',
  date_from: 'من تاريخ',
  date_to: 'إلى تاريخ',
  generate_report: 'إنشاء تقرير',
  
  // بەکارهێنەران
  full_name: 'الاسم الكامل',
  role: 'الدور',
  role_admin: 'مدير',
  role_employee: 'موظف',
  add_user: 'إضافة مستخدم',
  change_password: 'تغيير كلمة المرور',
  
  // پەیامەکان
  success: 'نجاح',
  error: 'خطأ',
  delete_confirm: 'هل أنت متأكد من الحذف؟',
  save_success: 'تم الحفظ بنجاح',
  delete_success: 'تم الحذف بنجاح',
  error_occurred: 'حدث خطأ',
  
  // دیکە
  active: 'نشط',
  inactive: 'غير نشط',
  price: 'السعر',
  duration: 'المدة',
  minutes: 'دقيقة'
};

// دۆخەکانی چاوپێکەوتن
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// جۆرەکانی داشکاندن
export const DISCOUNT_TYPES = {
  NONE: 'none',
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
};

// شێوازەکانی پارەدان
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card'
};

// ڕۆڵەکان
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};