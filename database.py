"""
ماژول مدیریت پایگاه‌داده SQLite برای برنامه مدیریت و تمرکز بر ایده‌ها.
طراحی شده با پشتیبانی از WAL mode، تراکنش‌های اتمیک و مدیریت خطای امن.
"""

import os
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


import sys


def get_default_db_path() -> str:
    """
    تعیین مسیر پایدار پایگاه‌داده با حفظ صددرصد سازگاری رو به عقب:
    ۱. اولویت اول: متغیر محیطی IDEAS_DB_PATH (در صورت تنظیم)
    ۲. اولویت دوم: در حالت کامپایل‌شده (PyInstaller Frozen)، ذخیره در %APPDATA%/IdeasFocusApp
    ۳. اولویت سوم: در حالت عادی توسعه (Development)، ذخیره در پوشه محلی پروژه
    """
    env_path = os.environ.get("IDEAS_DB_PATH")
    if env_path:
        return env_path

    if getattr(sys, 'frozen', False):
        app_data = os.environ.get('APPDATA') or os.path.expanduser('~')
        storage_dir = os.path.join(app_data, 'IdeasFocusApp')
        os.makedirs(storage_dir, exist_ok=True)
        target_db = os.path.join(storage_dir, 'ideas.db')

        # مهاجرت امن: اگر دیتابیسی در کنار فایل exe وجود داشته باشد و هنوز در APPDATA کپی نشده باشد
        try:
            exe_dir = os.path.dirname(sys.executable)
            local_exe_db = os.path.join(exe_dir, 'ideas.db')
            if os.path.exists(local_exe_db) and not os.path.exists(target_db):
                import shutil
                shutil.copy2(local_exe_db, target_db)
        except Exception:
            pass

        return target_db
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(base_dir, "ideas.db")


class Database:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            db_path = get_default_db_path()
        self.db_path = db_path
        self._init_db()

    def get_connection(self) -> sqlite3.Connection:
        """برقراری اتصال امن با تنظیمات بهینه SQLite."""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        # بهینه‌سازی‌های کارایی و پایداری داده
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_db(self) -> None:
        """مقداردهی اولیه جداول پایگاه‌داده در صورت عدم وجود."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # جدول اصلی ایده‌ها
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ideas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
                    status TEXT NOT NULL CHECK(status IN ('active', 'completed')) DEFAULT 'active',
                    is_focus_pinned INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    completed_at TEXT
                );
            """)
            # ایندکس‌ها جهت افزایش سرعت جستجو، فیلتر و مرتب‌سازی
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_ideas_status_priority 
                ON ideas(status, priority, created_at);
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_ideas_focus_pinned 
                ON ideas(is_focus_pinned);
            """)
            # جدول تنظیمات برنامه
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS app_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
            """)
            conn.commit()

    @staticmethod
    def _now_iso() -> str:
        """دریافت زمان کنونی به صورت استاندارد ISO 8601 UTC."""
        return datetime.now(timezone.utc).isoformat()

    def create_idea(self, title: str, description: Optional[str] = None, priority: str = "medium") -> Dict[str, Any]:
        """ثبت ایده جدید در وضعیت active."""
        clean_title = (title or "").strip()
        if not clean_title:
            raise ValueError("عنوان ایده نمی‌تواند خالی باشد.")
        
        priority = priority.lower() if priority else "medium"
        if priority not in ("high", "medium", "low"):
            priority = "medium"

        clean_desc = description.strip() if description else None
        now = self._now_iso()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO ideas (title, description, priority, status, is_focus_pinned, created_at, updated_at, completed_at)
                VALUES (?, ?, ?, 'active', 0, ?, ?, NULL)
            """, (clean_title, clean_desc, priority, now, now))
            idea_id = cursor.lastrowid
            conn.commit()

        return self.get_idea_by_id(idea_id)

    def get_idea_by_id(self, idea_id: int) -> Optional[Dict[str, Any]]:
        """دریافت اطلاعات یک ایده با شناسه یکتا."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None

    def get_active_ideas(self, search_query: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        دریافت ایده‌های فعال با ترتیب مشخص:
        High -> Medium -> Low و در هر سطح از قدیمی‌ترین به جدیدترین.
        """
        sql = """
            SELECT * FROM ideas
            WHERE status = 'active'
        """
        params = []

        if search_query and search_query.strip():
            query_pattern = f"%{search_query.strip()}%"
            sql += " AND (title LIKE ? OR description LIKE ?)"
            params.extend([query_pattern, query_pattern])

        # مرتب‌سازی دقیق: High اول، سپس Medium، سپس Low؛ درون هر سطح: قدیمی‌ترین اول (created_at ASC)
        sql += """
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                    ELSE 4 
                END ASC,
                created_at ASC
        """

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_completed_ideas(self, search_query: Optional[str] = None) -> List[Dict[str, Any]]:
        """دریافت ایده‌های انجام‌شده، مرتب‌شده از جدیدترین زمان تکمیل به قدیمی‌ترین."""
        sql = """
            SELECT * FROM ideas
            WHERE status = 'completed'
        """
        params = []

        if search_query and search_query.strip():
            query_pattern = f"%{search_query.strip()}%"
            sql += " AND (title LIKE ? OR description LIKE ?)"
            params.extend([query_pattern, query_pattern])

        sql += " ORDER BY completed_at DESC, id DESC"

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_focus_idea(self) -> Optional[Dict[str, Any]]:
        """
        الگوریتم دقیق استخراج ایده حالت تمرکز:
        1. ایده پین‌شده دستی (is_focus_pinned = 1)
        2. در غیر این صورت، قدیمی‌ترین ایده High
        3. در غیر این صورت، قدیمی‌ترین ایده Medium
        4. در غیر این صورت، قدیمی‌ترین ایده Low
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # بررسی ایده پین‌شده دستی
            cursor.execute("""
                SELECT * FROM ideas 
                WHERE status = 'active' AND is_focus_pinned = 1 
                LIMIT 1
            """)
            pinned = cursor.fetchone()
            if pinned:
                return dict(pinned)

            # انتخاب خودکار طبق اولویت و تاریخ ثبت
            cursor.execute("""
                SELECT * FROM ideas 
                WHERE status = 'active'
                ORDER BY 
                    CASE priority 
                        WHEN 'high' THEN 1 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 3 
                        ELSE 4 
                    END ASC,
                    created_at ASC
                LIMIT 1
            """)
            candidate = cursor.fetchone()
            if candidate:
                return dict(candidate)
            return None

    def update_idea(self, idea_id: int, title: str, description: Optional[str] = None, priority: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """ویرایش عنوان، توضیحات و اولویت یک ایده با اعتبارسنجی."""
        clean_title = (title or "").strip()
        if not clean_title:
            raise ValueError("عنوان ایده نمی‌تواند خالی باشد.")

        now = self._now_iso()
        clean_desc = description.strip() if description else None

        with self.get_connection() as conn:
            cursor = conn.cursor()
            if priority:
                priority = priority.lower()
                if priority not in ("high", "medium", "low"):
                    raise ValueError("اولویت نامعتبر است.")
                cursor.execute("""
                    UPDATE ideas 
                    SET title = ?, description = ?, priority = ?, updated_at = ?
                    WHERE id = ?
                """, (clean_title, clean_desc, priority, now, idea_id))
            else:
                cursor.execute("""
                    UPDATE ideas 
                    SET title = ?, description = ?, updated_at = ?
                    WHERE id = ?
                """, (clean_title, clean_desc, now, idea_id))
            conn.commit()

        return self.get_idea_by_id(idea_id)

    def change_priority(self, idea_id: int, new_priority: str) -> Optional[Dict[str, Any]]:
        """تغییر مستقیم سطح اولویت یک ایده و ذخیره آنی در پایگاه‌داده."""
        new_priority = new_priority.lower().strip()
        if new_priority not in ("high", "medium", "low"):
            raise ValueError("سطح اولویت باید یکی از مقادیر high، medium یا low باشد.")

        now = self._now_iso()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE ideas 
                SET priority = ?, updated_at = ?
                WHERE id = ?
            """, (new_priority, now, idea_id))
            conn.commit()

        return self.get_idea_by_id(idea_id)

    def set_focus_pin(self, idea_id: int, pinned: bool = True) -> Optional[Dict[str, Any]]:
        """
        تنظیم پین تمرکز روی یک ایده.
        قاعده: در هر لحظه حداکثر ۱ ایده می‌تواند وضعیت is_focus_pinned = 1 داشته باشد.
        """
        now = self._now_iso()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # ابتدا پین همه ایده‌ها برداشته می‌شود (تضمین تک پین بودن)
            cursor.execute("UPDATE ideas SET is_focus_pinned = 0 WHERE is_focus_pinned = 1")
            if pinned:
                cursor.execute("""
                    UPDATE ideas 
                    SET is_focus_pinned = 1, updated_at = ?
                    WHERE id = ? AND status = 'active'
                """, (now, idea_id))
            conn.commit()

        return self.get_idea_by_id(idea_id)

    def complete_idea(self, idea_id: int) -> Optional[Dict[str, Any]]:
        """
        تکمیل ایده: تغییر وضعیت به completed، ثبت completed_at، 
        و حذف خودکار وضعیت پین در صورت وجود.
        """
        now = self._now_iso()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE ideas 
                SET status = 'completed', 
                    completed_at = ?, 
                    is_focus_pinned = 0,
                    updated_at = ?
                WHERE id = ?
            """, (now, now, idea_id))
            conn.commit()

        return self.get_idea_by_id(idea_id)

    def undo_completion(self, idea_id: int) -> Optional[Dict[str, Any]]:
        """
        لغو عملیات تکمیل (Undo): بازگشت به وضعیت active و خالی شدن completed_at.
        سایر مشخصات (title, description, priority, created_at) بدون تغییر حفظ می‌شوند.
        """
        now = self._now_iso()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE ideas 
                SET status = 'active', 
                    completed_at = NULL,
                    updated_at = ?
                WHERE id = ?
            """, (now, idea_id))
            conn.commit()

        return self.get_idea_by_id(idea_id)

    def restore_idea(self, idea_id: int) -> Optional[Dict[str, Any]]:
        """بازیابی ایده از تب انجام‌شده به تب فعال."""
        return self.undo_completion(idea_id)

    def delete_idea_permanently(self, idea_id: int) -> bool:
        """حذف دائمی ایده از پایگاه‌داده SQLite."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM ideas WHERE id = ?", (idea_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_stats(self) -> Dict[str, int]:
        """دریافت آمار سریع ایده‌های فعال و انجام‌شده."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM ideas WHERE status = 'active'")
            active_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM ideas WHERE status = 'completed'")
            completed_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM ideas WHERE status = 'active' AND priority = 'high'")
            high_count = cursor.fetchone()[0]

            return {
                "active": active_count,
                "completed": completed_count,
                "high_priority": high_count
            }

    def get_setting(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """دریافت یک تنظیم از جدول app_settings."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM app_settings WHERE key = ?", (key,))
            row = cursor.fetchone()
            if row:
                return row[0]
            return default

    def set_setting(self, key: str, value: str) -> None:
        """ذخیره یک تنظیم در جدول app_settings."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO app_settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """, (key, value))
            conn.commit()
