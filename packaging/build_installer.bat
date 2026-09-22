@echo off
chcp 65001 >nul
title ساخت فایل نصبی ویندوز (Build Inno Setup Installer)
color 0b

echo ============================================================
echo   📦 در حال ساخت فایل نصبی برنامه (IdeasFocus_Setup)...
echo ============================================================
echo.

:: انتقال به پوشه ریشه پروژه
cd /d "%~dp0.."

:: بررسی وجود فایل‌های باینری کامپایل‌شده
if not exist "dist\IdeasFocus\IdeasFocus.exe" (
    echo [هشدار] پوشه dist\IdeasFocus یافت نشد.
    echo ابتدا در حال ساخت فایل‌های اجرایی با PyInstaller...
    call "packaging\build_desktop.bat"
    if not exist "dist\IdeasFocus\IdeasFocus.exe" (
        echo [خطا] ساخت فایل‌های اجرایی دسکتاپ با شکست مواجه شد.
        pause
        exit /b 1
    )
)

:: بررسی وجود Inno Setup Compiler
set "ISCC_PATH=C:\Program Files\Inno Setup 7\ISCC.exe"
if not exist "%ISCC_PATH%" (
    echo [خطا] فایل کامپایلر Inno Setup در مسیر زیر یافت نشد:
    echo %ISCC_PATH%
    pause
    exit /b 1
)

echo [*] در حال کامپایل اسکریپت packaging\installer.iss با Inno Setup 7...
"%ISCC_PATH%" /Qp "packaging\installer.iss"

if %errorlevel% neq 0 (
    echo.
    echo [خطا] فرآیند ساخت فایل نصبی با شکست مواجه شد.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   ✓ فایل نصبی با موفقیت در مسیر زیر ساخته شد:
echo   installer\IdeasFocus_Setup_v1.0.0.exe
echo ============================================================
echo.
pause
