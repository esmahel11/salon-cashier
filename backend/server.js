// دەستپێکردنی سێرڤەر
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// هەڵگرتنی سێرڤەر
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('🚀 سێرڤەر بە سەرکەوتوویی دەستی پێکرد');
  console.log(`📡 پۆرت: ${PORT}`);
  console.log(`🌐 لینکی کۆمپیوتەر: http://localhost:${PORT}`);
  console.log(`📱 لینکی مۆبایل: http://[IP-ی-کۆمپیوتەرەکەت]:${PORT}`);
  console.log(`📊 API Base: http://localhost:${PORT}/api`);
  console.log('========================================');
  console.log('💡 بۆ دۆزینەوەی IP ی کۆمپیوتەرەکەت:');
  console.log('   Windows: ipconfig');
  console.log('   Mac/Linux: ifconfig یان ip addr');
  console.log('========================================');
});

// هەڵەڕەشەی گشتی
process.on('uncaughtException', (err) => {
  console.error('❌ هەڵەی گرفت:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promise Rejection:', err);
  process.exit(1);
});