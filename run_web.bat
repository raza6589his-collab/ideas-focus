@echo off
chcp 65001 >nul
title برنامه مدیریت و تمرکز بر ایده‌ها (Focus Idea Engine)
color 0b

echo ============================================================
echo   🎯 در حال راه‌اندازی برنامه مدیریت و تمرکز بر ایده‌ها...
echo ============================================================
echo.

:: بررسی نصب بودن پایتون
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [خطا] پایتون در سیستم شما یافت نشد!
    echo لطفاً ابتدا پایتون ۳ را نصب کرده و تیک Add Python to PATH را بزنید.
    echo.
    pause
    exit /b 1
)

:: بررسی وابستگی Flask
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo [اطلاعیه] در حال نصب نیازمندی‌های پروژه (Flask)...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [خطا] نصب وابستگی‌ها با مشکل مواجه شد. لطفاً اتصال اینترنت را بررسی کنید.
        pause
        exit /b 1
    )
)

echo [✓] پایتون و نیازمندی‌ها آماده هستند.
echo [✓] در حال اجرای سرور محلی و باز کردن خودکار مرورگر...
echo.

python app.py

if %errorlevel% neq 0 (
    echo.
    echo [خطا] برنامه با خطا متوقف شد.
    pause
)
