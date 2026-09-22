"""
برنامه مدیریت و تمرکز بر ایده‌ها (Focus Idea Engine)
بک‌اند سبک و استاندارد پایتون بر پایه Flask و SQLite با دیتابیس WAL.
"""

import os
import sys
import threading
import webbrowser
from typing import Any, Dict, Tuple
from flask import Flask, jsonify, render_template, request
from database import Database

def get_resource_path(relative_path: str) -> str:
    """دریافت مسیر قطعی منابع با پشتیبانی از هر دو حالت توسعه و PyInstaller frozen."""
    if getattr(sys, 'frozen', False):
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)


app = Flask(
    __name__,
    template_folder=get_resource_path("templates"),
    static_folder=get_resource_path("static")
)
# تنظیم دیتابیس محلی
db = Database()

# اطلاعات نسخه و ریپازیتوری رسمی گیت‌هاب جهت بررسی خودکار به‌روزرسانی‌ها
APP_VERSION = "1.0.0"
GITHUB_REPO = "raza6589his-collab/ideas-focus"


# --- مسیرهای وب ---
@app.route("/")
def index():
    """صفحه اصلی برنامه."""
    return render_template("index.html")


# --- توابع کمکی پاسخ JSON ---
def success_response(data: Any = None, message: str = "عملیات با موفقیت انجام شد", status_code: int = 200) -> Tuple[Any, int]:
    return jsonify({
        "success": True,
        "message": message,
        "data": data
    }), status_code


def error_response(message: str, status_code: int = 400) -> Tuple[Any, int]:
    return jsonify({
        "success": False,
        "error": message
    }), status_code


# --- اندپوینت‌های RESTful API ---

@app.route("/api/ideas", methods=["GET"])
def get_ideas():
    """دریافت ایده‌ها بر اساس وضعیت (active یا completed) و عبارت جستجو."""
    status = request.args.get("status", "active").lower()
    search_query = request.args.get("q", "").strip()

    try:
        if status == "completed":
            ideas = db.get_completed_ideas(search_query=search_query)
        else:
            ideas = db.get_active_ideas(search_query=search_query)

        stats = db.get_stats()
        return success_response({
            "ideas": ideas,
            "stats": stats,
            "count": len(ideas)
        })
    except Exception as e:
        return error_response(f"خطا در دریافت اطلاعات: {str(e)}", 500)


@app.route("/api/ideas/focus", methods=["GET"])
def get_focus_idea():
    """دریافت ایده برگزیده برای حالت تمرکز (Focus Mode) طبق الگوریتم محصول."""
    try:
        idea = db.get_focus_idea()
        stats = db.get_stats()
        return success_response({
            "idea": idea,
            "stats": stats
        })
    except Exception as e:
        return error_response(f"خطا در دریافت ایده تمرکز: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>", methods=["GET"])
def get_single_idea(idea_id: int):
    """دریافت جزئیات یک ایده با شناسه یکتا."""
    try:
        idea = db.get_idea_by_id(idea_id)
        if not idea:
            return error_response("ایده مورد نظر یافت نشد.", 404)
        return success_response(idea)
    except Exception as e:
        return error_response(f"خطا در واکشی ایده: {str(e)}", 500)


@app.route("/api/ideas", methods=["POST"])
def create_idea():
    """ثبت سریع ایده جدید."""
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip() or None
    priority = (data.get("priority") or "medium").strip()

    if not title:
        return error_response("وارد کردن عنوان ایده الزامی است.", 400)

    try:
        new_idea = db.create_idea(title=title, description=description, priority=priority)
        return success_response(new_idea, "ایده با موفقیت ثبت شد.", 201)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(f"خطا در ثبت ایده در پایگاه‌داده: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>", methods=["PUT"])
def update_idea(idea_id: int):
    """ویرایش اطلاعات ایده (عنوان، توضیحات و اولویت)."""
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    description = data.get("description")
    priority = data.get("priority")

    if not title:
        return error_response("عنوان ایده نمی‌تواند خالی باشد.", 400)

    try:
        updated = db.update_idea(idea_id, title=title, description=description, priority=priority)
        if not updated:
            return error_response("ایده مورد نظر برای ویرایش یافت نشد.", 404)
        return success_response(updated, "ایده با موفقیت به‌روزرسانی شد.")
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(f"خطا در ویرایش ایده: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>/priority", methods=["PATCH"])
def change_priority(idea_id: int):
    """تغییر مستقیم سطح اولویت یک ایده از روی کارت."""
    data = request.get_json(silent=True) or {}
    priority = (data.get("priority") or "").strip()

    if priority not in ("high", "medium", "low"):
        return error_response("سطح اولویت باید یکی از مقادیر high، medium یا low باشد.", 400)

    try:
        updated = db.change_priority(idea_id, priority)
        if not updated:
            return error_response("ایده مورد نظر یافت نشد.", 404)
        return success_response(updated, "اولویت ایده با موفقیت تغییر کرد.")
    except Exception as e:
        return error_response(f"خطا در تغییر اولویت: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>/pin", methods=["POST"])
def toggle_pin(idea_id: int):
    """پین کردن یا لغو پین یک ایده برای حالت تمرکز (حداکثر ۱ پین در هر لحظه)."""
    data = request.get_json(silent=True) or {}
    pinned = bool(data.get("pinned", True))

    try:
        updated = db.set_focus_pin(idea_id, pinned)
        if not updated:
            return error_response("ایده مورد نظر یافت نشد.", 404)
        return success_response(updated, "وضعیت سنجاق تمرکز به‌روزرسانی شد.")
    except Exception as e:
        return error_response(f"خطا در تنظیم سنجاق تمرکز: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>/complete", methods=["POST"])
def complete_idea(idea_id: int):
    """تکمیل ایده و انتقال از فعال به انجام‌شده."""
    try:
        completed = db.complete_idea(idea_id)
        if not completed:
            return error_response("ایده مورد نظر یافت نشد.", 404)
        return success_response(completed, "ایده با موفقیت به پایان رسید.")
    except Exception as e:
        return error_response(f"خطا در تکمیل ایده: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>/undo", methods=["POST"])
def undo_complete(idea_id: int):
    """لغو عملیات تکمیل ایده (Undo) و بازگرداندن آن به لیست فعال با حفظ تمام متادیتا."""
    try:
        restored = db.undo_completion(idea_id)
        if not restored:
            return error_response("ایده مورد نظر برای بازگردانی یافت نشد.", 404)
        return success_response(restored, "ایده به لیست ایده‌های در حال انجام بازگردانده شد.")
    except Exception as e:
        return error_response(f"خطا در لغو تکمیل: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>/restore", methods=["POST"])
def restore_idea(idea_id: int):
    """بازیابی ایده از تب انجام‌شده به تب فعال."""
    try:
        restored = db.restore_idea(idea_id)
        if not restored:
            return error_response("ایده مورد نظر برای بازیابی یافت نشد.", 404)
        return success_response(restored, "ایده با موفقیت به لیست فعال بازگردانده شد.")
    except Exception as e:
        return error_response(f"خطا در بازیابی ایده: {str(e)}", 500)


@app.route("/api/ideas/<int:idea_id>", methods=["DELETE"])
def delete_idea(idea_id: int):
    """حذف دائمی ایده از دیتابیس پس از تأیید در مودال."""
    try:
        success = db.delete_idea_permanently(idea_id)
        if not success:
            return error_response("ایده مورد نظر یافت نشد یا قبلاً حذف شده است.", 404)
        return success_response(None, "ایده برای همیشه حذف شد.")
    except Exception as e:
        return error_response(f"خطا در حذف ایده: {str(e)}", 500)


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """دریافت آمار کلی برنامه."""
    try:
        stats = db.get_stats()
        return success_response(stats)
    except Exception as e:
        return error_response(f"خطا در دریافت آمار: {str(e)}", 500)


@app.route("/api/settings", methods=["GET", "POST"])
def handle_settings():
    """دریافت یا ذخیره تنظیمات کاربر (مانند تم تاریک/روشن)."""
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        key = data.get("key")
        value = data.get("value")
        if not key or value is None:
            return error_response("کلید و مقدار تنظیم الزامی هستند.", 400)
        try:
            db.set_setting(str(key), str(value))
            return success_response(None, "تنظیم با موفقیت ذخیره شد.")
        except Exception as e:
            return error_response(f"خطا در ذخیره تنظیم: {str(e)}", 500)
    else:
        key = request.args.get("key")
        if not key:
            return error_response("کلید تنظیم نامشخص است.", 400)
        try:
            val = db.get_setting(key)
            return success_response({"key": key, "value": val})
        except Exception as e:
            return error_response(f"خطا در واکشی تنظیم: {str(e)}", 500)


@app.route("/api/check-update", methods=["GET"])
def check_update():
    """
    بررسی آنلاین وضعیت آخرین نسخه پایدار منتشرشده در گیت‌هاب (GitHub Releases API)
    در صورت وجود نسخه جدیدتر، اطلاعات ارتقا و لینک مستقیم دانلود را بازمی‌گرداند.
    """
    import json
    import re
    import urllib.request

    def parse_version(v_str: str):
        digits = [int(x) for x in re.findall(r'\d+', str(v_str))]
        return digits or [0]

    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
    req = urllib.request.Request(
        api_url,
        headers={
            "User-Agent": f"IdeasFocusApp/{APP_VERSION}",
            "Accept": "application/vnd.github.v3+json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                latest_tag = data.get("tag_name", "")
                latest_clean = latest_tag.lstrip("vV")
                current_clean = APP_VERSION.lstrip("vV")

                is_newer = parse_version(latest_clean) > parse_version(current_clean)

                return success_response({
                    "update_available": is_newer,
                    "current_version": APP_VERSION,
                    "latest_version": latest_clean or latest_tag,
                    "release_name": data.get("name", ""),
                    "release_notes": data.get("body", ""),
                    "release_url": data.get("html_url", f"https://github.com/{GITHUB_REPO}/releases/latest"),
                    "published_at": data.get("published_at", "")
                })
    except Exception as e:
        # در صورت نبود اینترنت، فیلتر بودن یا عدم وجود Release در گیت‌هاب، سیستم به آرامی اطلاع می‌دهد
        return success_response({
            "update_available": False,
            "current_version": APP_VERSION,
            "error_detail": str(e)
        })


def open_browser():
    """باز کردن خودکار مرورگر پیش‌فرض سیستم در پس‌زمینه."""
    webbrowser.open("http://127.0.0.1:5000/")


if __name__ == "__main__":
    port = 5000
    print("=" * 60)
    print("🚀 برنامه مدیریت و تمرکز بر ایده‌ها (Focus Idea Engine)")
    print(f"🔗 آدرس برنامه در مرورگر: http://127.0.0.1:{port}/")
    print("🛑 جهت توقف برنامه، کلیدهای Ctrl + C را در ترمینال فشار دهید.")
    print("=" * 60)

    # باز کردن مرورگر سیستم تنها در صورتی که اجرای اصلی باشد (نه در حالت reload خودکار)
    if not os.environ.get("WERKZEUG_RUN_MAIN"):
        threading.Timer(1.2, open_browser).start()

    app.run(host="127.0.0.1", port=port, debug=False)
