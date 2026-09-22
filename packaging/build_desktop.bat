@echo off
chcp 65001 >nul
title ساخت فایل اجرایی دسکتاپ (Build Desktop EXE)
color 0e

echo ============================================================
echo   📦 در حال ساخت فایل اجرایی ویندوز (IdeasFocus.exe)...
echo ============================================================
echo.

:: انتقال به پوشه ریشه پروژه
cd /d "%~dp0.."

:: بررسی وجود PyInstaller
pyinstaller --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [خطا] PyInstaller یافت نشد! در حال نصب...
    pip install pyinstaller
    if %errorlevel% neq 0 (
        echo [خطا] نصب PyInstaller ناموفق بود.
        pause
        exit /b 1
    )
)

echo [*] در حال اجرای فرآیند کامپایل و بسته‌بندی با PyInstaller...
pyinstaller --clean -y --distpath dist --workpath build packaging\IdeasFocus.spec

if %errorlevel% neq 0 (
    echo.
    echo [خطا] فرآیند ساخت فایل اجرایی با شکست مواجه شد.
    pause
    exit /b 1
)

:: کپی مستقیم منابع آیکون به پوشه ریشه برنامه
xcopy /y /e /i "desktop" "dist\IdeasFocus\desktop" >nul 2>&1

echo.
echo ============================================================
echo   ✓ فایل اجرایی با موفقیت در مسیر زیر ساخته شد:
echo   dist\IdeasFocus\IdeasFocus.exe
echo ============================================================
echo.
pause
