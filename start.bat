@echo off
echo ========================================
echo سیستەمی کاشێری ئارایشتگا
echo Beauty Salon POS System
echo ========================================
echo.

echo یەکەم: دامەزراندنی پاکەتەکان...
echo.

echo دامەزراندنی Backend...
cd backend
call npm install
echo.

echo دامەزراندنی Frontend...
cd ../frontend
call npm install
cd ..
echo.

echo ========================================
echo پاکەتەکان دامەزران
echo ========================================
echo.

echo ئێستا سیستەمەکە دەستپێدەکات...
echo Backend لەسەر: http://localhost:5000
echo Frontend لەسەر: http://localhost:3000
echo.
echo بۆ وەستاندن Ctrl+C لێبدە
echo ========================================
echo.

start cmd /k "cd backend && npm start"
timeout /t 3
start cmd /k "cd frontend && npm start"

echo.
echo ✅ سیستەمەکە هەڵگیرا!
echo.
pause