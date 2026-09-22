"""
برنامه دسکتاپ ویندوز برای مدیریت و تمرکز بر ایده‌ها (Ideas & Focus - Windows Desktop Edition)
پیاده‌سازی شده با PySide6 و Qt WebEngine با میزبانی بومی رابط کاربری و بک‌اند مشترک Flask و SQLite.
"""

import os
import sys
import time
import socket
import logging
import threading
import urllib.request
from typing import Optional

from PySide6.QtCore import Qt, QUrl, QTimer, QSize
from PySide6.QtGui import QIcon, QKeySequence, QAction, QGuiApplication, QDesktopServices
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QMessageBox,
    QMenu,
    QVBoxLayout,
    QWidget
)
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWebEngineCore import QWebEngineSettings, QWebEnginePage

# حل مسیرهای داینامیک در هر دو حالت Dev و PyInstaller Frozen
def get_resource_path(relative_path: str) -> str:
    if getattr(sys, 'frozen', False):
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
        candidate = os.path.join(base_path, relative_path)
        if os.path.exists(candidate):
            return candidate
        internal_candidate = os.path.join(os.path.dirname(sys.executable), '_internal', relative_path)
        if os.path.exists(internal_candidate):
            return internal_candidate
        return candidate
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(base_path, relative_path)


def find_free_port(preferred_port: int = 5000) -> int:
    """یافتن پورت آزاد روی لوکال‌هاست (127.0.0.1)."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        if s.connect_ex(('127.0.0.1', preferred_port)) != 0:
            return preferred_port

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def wait_for_server(port: int, timeout: float = 12.0) -> bool:
    """بررسی آمادگی قطعی سرور محلی قبل از لود شدن صفحه در وب‌انجین."""
    url = f"http://127.0.0.1:{port}/api/stats"
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'IdeasFocusDesktop/1.0'})
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.12)
    return False


class DesktopWebPage(QWebEnginePage):
    """صفحه وب اختصاصی که لینک‌های بیرونی (مانند دانلود گیت‌هاب) را در مرورگر پیش‌فرض سیستم باز می‌کند."""
    def acceptNavigationRequest(self, url, nav_type, is_main_frame):
        host = url.host().lower()
        if host not in ("127.0.0.1", "localhost", "") and url.scheme() in ("http", "https"):
            QDesktopServices.openUrl(url)
            return False
        return super().acceptNavigationRequest(url, nav_type, is_main_frame)


class DesktopWebEngineView(QWebEngineView):
    """وب‌انجین سفارشی‌شده با منوی کلیک راست بومی و تمیز فارسی."""
    
    def contextMenuEvent(self, event):
        menu = QMenu(self)
        page = self.page()

        cut_action = page.action(QWebEnginePage.WebAction.Cut)
        copy_action = page.action(QWebEnginePage.WebAction.Copy)
        paste_action = page.action(QWebEnginePage.WebAction.Paste)
        select_all = page.action(QWebEnginePage.WebAction.SelectAll)

        cut_action.setText("بریدن (Cut)")
        copy_action.setText("کپی (Copy)")
        paste_action.setText("چسباندن (Paste)")
        select_all.setText("انتخاب همه (Select All)")

        has_selection = bool(self.selectedText())

        if cut_action.isEnabled():
            menu.addAction(cut_action)
        if copy_action.isEnabled() or has_selection:
            menu.addAction(copy_action)
        if paste_action.isEnabled():
            menu.addAction(paste_action)
        if select_all.isEnabled():
            menu.addSeparator()
            menu.addAction(select_all)

        if not menu.isEmpty():
            menu.exec(event.globalPos())


class DesktopMainWindow(QMainWindow):
    def __init__(self, app_url: str):
        super().__init__()
        self.app_url = app_url
        self._init_ui()

    def _init_ui(self):
        # عنوان رسمی و آیکون بومی برنامه
        self.setWindowTitle("ایده‌ها و تمرکز | Ideas & Focus")
        
        icon = QIcon()
        icon_path_ico = get_resource_path(os.path.join("desktop", "app_icon.ico"))
        icon_path_png = get_resource_path(os.path.join("desktop", "app_icon.png"))
        if os.path.exists(icon_path_ico):
            icon.addFile(icon_path_ico)
        if os.path.exists(icon_path_png):
            icon.addFile(icon_path_png)
        if not icon.isNull():
            self.setWindowIcon(icon)

        # تنظیم اندازه معقول اولیه در مرکز مانیتور
        screen = QGuiApplication.primaryScreen().availableGeometry()
        init_w = min(1080, max(880, int(screen.width() * 0.72)))
        init_h = min(780, max(620, int(screen.height() * 0.78)))
        
        self.resize(init_w, init_h)
        self.setMinimumSize(QSize(820, 560))
        
        # قرار دادن پنجره در مرکز صفحه نمایش
        self.setGeometry(
            (screen.width() - init_w) // 2,
            (screen.height() - init_h) // 2,
            init_w,
            init_h
        )

        # ساخت کامپوننت رندرینگ وب‌انجین
        self.browser = DesktopWebEngineView(self)
        self.web_page = DesktopWebPage(self.browser)
        self.browser.setPage(self.web_page)
        
        # پیکربندی تنظیمات امنیتی و ذخیره‌سازی محلی
        settings = self.browser.settings()
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.ScrollAnimatorEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.ErrorPageEnabled, False)

        # چیدمان مرکزی
        container = QWidget(self)
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        layout.addWidget(self.browser)
        self.setCentralWidget(container)

        # لود کردن آدرس سرور محلی
        self.browser.setUrl(QUrl(self.app_url))

        # کلیدهای میانبر سطح پنجره برای دسترسی‌پذیری و ریفرش بدون نوار ابزار
        self._setup_shortcuts()

    def _setup_shortcuts(self):
        # کلید F5 برای بارگذاری مجدد صفحه
        reload_action = QAction(self)
        reload_action.setShortcut(QKeySequence("F5"))
        reload_action.triggered.connect(self.browser.reload)
        self.addAction(reload_action)

    def closeEvent(self, event):
        """خروج تمیز و آزادسازی منابع پنجره."""
        self.browser.stop()
        event.accept()


def start_flask_server(port: int):
    """اجرای پس‌زمینه سرور Flask انحصارا روی 127.0.0.1."""
    # خاموش کردن لاگ‌های اضافی Werkzeug
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    from app import app
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False, threaded=True)


def main():
    # ثبت AppUserModelID برای نمایش صحیح آیکون در تسک‌بار ویندوز و گروه‌بندی پنجره‌ها
    if sys.platform == "win32":
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("iran.ideasfocus.desktop.1.0")
        except Exception:
            pass

    # تنظیمات پیش‌نیاز رندرینگ برای ویندوز
    os.environ["QTWEBENGINE_CHROMIUM_FLAGS"] = "--disable-logging --disable-gpu-shader-disk-cache"

    app = QApplication.instance()
    if not app:
        app = QApplication(sys.argv)
    
    app.setApplicationName("IdeasFocus")
    app.setApplicationDisplayName("ایده‌ها و تمرکز")

    # تنظیم آیکون اپلیکیشن در سطح سراسری Qt (برای تسک‌بار، دیالوگ‌ها و پنجره‌ها)
    app_icon = QIcon()
    icon_path_ico = get_resource_path(os.path.join("desktop", "app_icon.ico"))
    icon_path_png = get_resource_path(os.path.join("desktop", "app_icon.png"))
    if os.path.exists(icon_path_ico):
        app_icon.addFile(icon_path_ico)
    if os.path.exists(icon_path_png):
        app_icon.addFile(icon_path_png)
    if not app_icon.isNull():
        app.setWindowIcon(app_icon)

    # انتخاب پورت آزاد
    port = find_free_port(5000)

    # اجرای سرور Flask در یک ترد Daemon پس‌زمینه
    flask_thread = threading.Thread(target=start_flask_server, args=(port,), daemon=True)
    flask_thread.start()

    # بررسی قطعی آمادگی سرور (حداکثر ۱۲ ثانیه)
    if not wait_for_server(port, timeout=12.0):
        QMessageBox.critical(
            None,
            "خطای راه‌اندازی | Startup Error",
            "امکان برقراری ارتباط با هسته پایگاه‌داده محلی برنامه وجود ندارد.\nلطفاً از باز نبودن نسخه دیگری از برنامه اطمینان حاصل کنید."
        )
        sys.exit(1)

    # ایجاد و نمایش پنجره دسکتاپ
    app_url = f"http://127.0.0.1:{port}/"
    main_window = DesktopMainWindow(app_url)
    main_window.show()

    # اجرای حلقه رویدادهای Qt
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
