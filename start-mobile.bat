@echo off
chcp 65001 >nul
echo ========================================
echo 📱 دەستپێکردنی سیستەمی کاشێری مۆبایل
echo ========================================
echo.

echo 🔍 دۆزینەوەی IP Address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo ✅ IP ی کۆمپیوتەرەکەت: %IP%
echo.
echo 📝 بۆ بەکارهێنان لە مۆبایل:
echo    1. دڵنیابە کە مۆبایل و کۆمپیوتەر لە هەمان WiFi ن
echo    2. لە مۆبایلەکەت بڕۆ بۆ: http://%IP%:3000
echo.
echo ========================================
echo.

echo 🚀 دەستپێکردنی Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 >nul

echo 🚀 دەستپێکردنی Frontend...
start "Frontend Server" cmd /k "cd frontend && set REACT_APP_API_URL=http://%IP%:5000/api && npm start"

echo.
echo ✅ سیستەمەکە دەستی پێکرد!
echo.
echo 💻 لە کۆمپیوتەر: http://localhost:3000
echo 📱 لە مۆبایل: http://%IP%:3000
echo.
echo ⚠️  بۆ وەستاندن، دوو پەنجەرەکە دابخە
echo ========================================
pause
