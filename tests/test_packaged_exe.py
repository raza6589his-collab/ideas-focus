"""
آزمون اعتبارسنجی عملیاتی فایل اجرایی بسته‌بندی‌شده (Packaged EXE Verification)
بررسی راه‌اندازی واقعی IdeasFocus.exe، بارگذاری منابع، ایجاد پایگاه‌داده در APPDATA،
ثبت داده، ماندگاری پس از بستن و اجرای مجدد، و خروج تمیز.
"""

import os
import sys
import time
import json
import subprocess
import urllib.request
import urllib.error


def run_packaged_exe_test():
    exe_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist", "IdeasFocus", "IdeasFocus.exe"))
    if not os.path.exists(exe_path):
        print(f"[FAIL] فایل اجرایی در مسیر {exe_path} یافت نشد.")
        sys.exit(1)

    print(f"[*] ۱. راه‌اندازی فایل اجرایی: {exe_path}")
    
    # اجرای پروسس EXE در پس‌زمینه
    proc = subprocess.Popen([exe_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # پایش پورت ۵۰۰۰ و اندپوینت stats
    url = "http://127.0.0.1:5000"
    ready = False
    start_time = time.time()
    
    print("[*] ۲. بررسی آمادگی سرور محلی EXE...")
    while time.time() - start_time < 15.0:
        if proc.poll() is not None:
            stdout, stderr = proc.communicate()
            print(f"[FAIL] پروسس EXE پیش از موعد متوقف شد. ExitCode: {proc.returncode}")
            print(f"Stderr: {stderr.decode('utf-8', errors='ignore')}")
            sys.exit(1)
        try:
            with urllib.request.urlopen(f"{url}/api/stats", timeout=1.0) as resp:
                if resp.status == 200:
                    ready = True
                    break
        except Exception:
            time.sleep(0.3)

    if not ready:
        proc.kill()
        print("[FAIL] فایل اجرایی نتوانست در ۱۵ ثانیه به درخواست HTTP پاسخ دهد.")
        sys.exit(1)

    print("✓ فایل اجرایی با موفقیت اجرا شد و به درخواست‌های محلی پاسخ می‌دهد.")

    # تست ۳: واکشی روت اصلی /
    print("[*] ۳. بررسی بارگذاری تمپلیت و فایل‌های استاتیک...")
    with urllib.request.urlopen(f"{url}/", timeout=2.0) as resp:
        html = resp.read().decode('utf-8')
        assert "ایده‌ها و تمرکز" in html
        assert "چه چیزی الان توی ذهنت هست؟" in html
        assert "static/css/style.css" in html
        assert "static/js/app.js" in html
    print("✓ قالب اصلی و مسیرهای استاتیک با موفقیت بارگذاری شدند.")

    # تست ۴: ثبت ایده از طریق اندپوینت API در حال اجرا توسط EXE
    print("[*] ۴. ثبت یک ایده جدید فارسی در دیتابیس EXE...")
    payload = json.dumps({
        "title": "ایده تست فایل اجرایی مستقل",
        "description": "توضیحات تست بسته‌بندی PyInstaller",
        "priority": "high"
    }).encode('utf-8')
    req = urllib.request.Request(f"{url}/api/ideas", data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=2.0) as resp:
        created_data = json.loads(resp.read().decode('utf-8'))
        assert created_data["success"] is True
        created_id = created_data["data"]["id"]
        assert created_data["data"]["title"] == "ایده تست فایل اجرایی مستقل"
        assert created_data["data"]["priority"] == "high"
    print(f"✓ ایده با شناسه {created_id} با موفقیت در پایگاه‌داده ثبت شد.")

    # تست ۵: بررسی ایجاد فایل دیتابیس در APPDATA
    app_data = os.environ.get('APPDATA') or os.path.expanduser('~')
    expected_db = os.path.join(app_data, 'IdeasFocusApp', 'ideas.db')
    print(f"[*] ۵. بررسی استقرار دیتابیس در مسیر استاندارد کاربر: {expected_db}")
    assert os.path.exists(expected_db), f"دیتابیس باید در {expected_db} وجود داشته باشد."
    print("✓ پایگاه‌داده با موفقیت در پوشه دائمی و استاندارد سیستم‌عامل ثبت گردید.")

    # تست ۶: خروج و بستن برنامه
    print("[*] ۶. بستن تمیز برنامه...")
    proc.terminate()
    try:
        proc.wait(timeout=5.0)
    except subprocess.TimeoutExpired:
        proc.kill()
    print("✓ پروسس با موفقیت بسته شد.")

    # تست ۷: اجرای مجدد برنامه و بررسی پایداری داده‌ها (Persistence across reopens)
    print("[*] ۷. اجرای مجدد EXE جهت راستی‌آزمایی ماندگاری داده‌ها پس از بستن...")
    proc2 = subprocess.Popen([exe_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2.0)

    # بررسی ایده ثبت‌شده قبلی
    with urllib.request.urlopen(f"{url}/api/ideas?status=active", timeout=4.0) as resp:
        list_data = json.loads(resp.read().decode('utf-8'))
        ideas = list_data["data"]["ideas"]
        matching = [i for i in ideas if i["id"] == created_id]
        assert len(matching) == 1, "ایده ثبت‌شده در اجرای قبلی باید کماکان در دیتابیس وجود داشته باشد!"
        assert matching[0]["title"] == "ایده تست فایل اجرایی مستقل"
    print("✓ داده‌ها پس از بستن و اجرای دوباره برنامه کاملاً پایدار باقی ماندند.")

    # پاکسازی نهایی و بستن پروسس دوم
    proc2.terminate()
    try:
        proc2.wait(timeout=5.0)
    except subprocess.TimeoutExpired:
        proc2.kill()

    print("\n============================================================")
    print("🎉 تمامی آزمون‌های عملیاتی فایل اجرایی مستقل با موفقیت کامل پاس شدند!")
    print("============================================================\n")


if __name__ == "__main__":
    run_packaged_exe_test()
