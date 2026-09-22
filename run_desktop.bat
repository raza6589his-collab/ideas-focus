@echo off
chcp 65001 >nul
title ایده‌ها و تمرکز | نسخه دسکتاپ ویندوز
color 0b

echo ============================================================
echo   🎯 در حال راه‌اندازی نسخه دسکتاپ برنامه ایده‌ها و تمرکز...
echo ============================================================
echo.

:: بررسی وجود پایتون
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [خطا] پایتون در سیستم شما یافت نشد!
    echo لطفاً ابتدا پایتون ۳ را نصب کرده و گزینه Add Python to PATH را علامت بزنید.
    echo.
    pause
    exit /b 1
)

:: بررسی پیش‌نیازهای دسکتاپ
python -c "import PySide6; from PySide6.QtWebEngineWidgets import QWebEngineView; import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo [اطلاعیه] در حال نصب نیازمندی‌های برنامه (PySide6, Flask, Pillow)...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [خطا] نصب وابستگی‌ها با مشکل مواجه شد. لطفاً اتصال اینترنت را بررسی کنید.
        pause
        exit /b 1
    )
)

echo [✓] پایتون و نیازمندی‌های دسکتاپ آماده هستند.
echo [✓] در حال باز کردن پنجره بومی دسکتاپ...
echo.

python desktop_app.py

if %errorlevel% neq 0 (
    echo.
    echo [خطا] برنامه دسکتاپ با خطا متوقف شد.
    pause
)
