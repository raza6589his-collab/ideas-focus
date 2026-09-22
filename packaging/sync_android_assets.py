"""
اسکریپت همگام‌سازی و آماده‌سازی دارایی‌های وب برای پکیج آفلاین اندروید
"""

import os
import shutil
import re

def sync_assets():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    assets_www = os.path.join(project_root, 'android', 'app', 'src', 'main', 'assets', 'www')
    os.makedirs(assets_www, exist_ok=True)

    # ۱. کپی پوشه استاتیک (CSS, JS, Fonts, Icons)
    static_dir = os.path.join(project_root, 'static')
    for item in os.listdir(static_dir):
        s = os.path.join(static_dir, item)
        d = os.path.join(assets_www, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)

    # ۲. تبدیل قالب index.html و حذف عبارات Jinja برای اجرای بدون سرور
    template_html = os.path.join(project_root, 'templates', 'index.html')
    with open(template_html, 'r', encoding='utf-8') as f:
        content = f.read()

    # جایگزینی عبارات url_for با مسیرهای نسبی خالص
    clean_html = re.sub(r"\{\{\s*url_for\('static',\s*filename='([^']+)'\)\s*\}\}", r"\1", content)

    # اطمینان از قرار داشتن storage_adapter.js
    if 'storage_adapter.js' not in clean_html:
        clean_html = clean_html.replace('js/app.js', 'js/storage_adapter.js"></script>\n    <script src="js/app.js')

    output_index = os.path.join(assets_www, 'index.html')
    with open(output_index, 'w', encoding='utf-8') as f:
        f.write(clean_html)

    print("✓ دارایی‌های وب با موفقیت در android/app/src/main/assets/www همگام‌سازی شدند.")
    print("لیست اقلام:", os.listdir(assets_www))

if __name__ == '__main__':
    sync_assets()
