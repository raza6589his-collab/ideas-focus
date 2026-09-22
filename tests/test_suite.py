"""
مجموعه آزمون‌های خودکار و جامع (Automated Test Suite)
پوشش‌دهنده تمامی ۲۰ بند آزمون الزامی در مشخصات محصول:
۱. ایجاد ایده
۲. ایجاد چند ایده با اولویت‌های مختلف
۳. ترتیب صحیح Active Ideas (High -> Medium -> Low و قدیمی به جدید)
۴. تغییر Priority
۵. ویرایش ایده
۶. جستجو در عنوان و توضیحات
۷. پین کردن (Pin) و قانون حداکثر یک پین
۸. الگوریتم Focus Mode
۹. تکمیل ایده (Complete)
۱۰. لغو تکمیل (Undo)
۱۱. بازیابی (Restore)
۱۲. حذف دائمی (Permanent Delete)
۱۳. شبیه‌سازی ریفرش
۱۴. شبیه‌سازی بستن و راه‌اندازی مجدد سرور (Restart)
۱۵. پایداری داده‌ها در دیسک
۱۶. سناریوی لیست خالی (Empty State)
۱۷. اعتبارسنجی عنوان خالی
۱۸. مدیریت عناوین طولانی
۱۹. شبیه‌سازی درخواست‌های سریع متوالی (Rapid Actions)
۲۰. آزمون مقیاس‌پذیری و استرس با ۱۰۰ ایده (Stress Test: 100 Ideas + Search + Sort + Edit)
"""

import os
import sys
import time
import unittest
from datetime import datetime

# افزودن ریشه پروژه به مسیر ماژول‌ها
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# جلوگیری از ایجاد دیتابیس در ریشه پروژه حین ایمپورت
os.environ["IDEAS_DB_PATH"] = os.path.join(os.path.dirname(__file__), "test_temp.db")

from database import Database
from app import app


class TestIdeaEngine(unittest.TestCase):
    TEST_DB_NAME = os.path.join(os.path.dirname(__file__), "test_ideas_suite.db")

    def setUp(self):
        # استفاده از دیتابیس تستی مجزا
        if os.path.exists(self.TEST_DB_NAME):
            try:
                os.remove(self.TEST_DB_NAME)
            except Exception:
                pass
        self.db = Database(self.TEST_DB_NAME)
        app.config['TESTING'] = True
        # جایگزینی دیتابیس اپ با دیتابیس تستی
        import app as app_module
        app_module.db = self.db
        self.client = app.test_client()

    def tearDown(self):
        # بستن و پاکسازی دیتابیس تستی
        del self.db
        import gc
        gc.collect()
        for ext in ["", "-wal", "-shm"]:
            f = self.TEST_DB_NAME + ext
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass

    # ۱. ایجاد ایده
    def test_01_create_idea(self):
        idea = self.db.create_idea("ایده طراحی موتور جستجو", "یادداشت‌های فنی", "high")
        self.assertIsNotNone(idea["id"])
        self.assertEqual(idea["title"], "ایده طراحی موتور جستجو")
        self.assertEqual(idea["description"], "یادداشت‌های فنی")
        self.assertEqual(idea["priority"], "high")
        self.assertEqual(idea["status"], "active")
        self.assertIsNotNone(idea["created_at"])
        self.assertIsNone(idea["completed_at"])

    # ۲. ایجاد چند ایده با Priority مختلف
    def test_02_create_multiple_ideas_different_priorities(self):
        i1 = self.db.create_idea("ایده کم‌اهمیت", priority="low")
        i2 = self.db.create_idea("ایده با اهمیت متوسط", priority="medium")
        i3 = self.db.create_idea("ایده فوق‌العاده حیاتی", priority="high")
        self.assertEqual(i1["priority"], "low")
        self.assertEqual(i2["priority"], "medium")
        self.assertEqual(i3["priority"], "high")

    # ۳. ترتیب صحیح Active Ideas (High -> Medium -> Low و قدیمی به جدید)
    def test_03_active_ideas_ordering(self):
        # ایجاد ایده‌ها با ترتیب زمانی
        self.db.create_idea("ایده کم ۱", priority="low")
        time.sleep(0.01)
        self.db.create_idea("ایده متوسط ۱", priority="medium")
        time.sleep(0.01)
        self.db.create_idea("ایده زیاد ۱", priority="high")
        time.sleep(0.01)
        self.db.create_idea("ایده زیاد ۲ (جدیدتر)", priority="high")
        time.sleep(0.01)
        self.db.create_idea("ایده متوسط ۲ (جدیدتر)", priority="medium")

        active = self.db.get_active_ideas()
        self.assertEqual(len(active), 5)
        # باید ابتدا تمام زیادها باشند و در داخل زیاد، قدیمی‌تر اول بیاید
        self.assertEqual(active[0]["title"], "ایده زیاد ۱")
        self.assertEqual(active[1]["title"], "ایده زیاد ۲ (جدیدتر)")
        # سپس متوسط‌ها، قدیمی‌تر اول
        self.assertEqual(active[2]["title"], "ایده متوسط ۱")
        self.assertEqual(active[3]["title"], "ایده متوسط ۲ (جدیدتر)")
        # سپس کم
        self.assertEqual(active[4]["title"], "ایده کم ۱")

    # ۴. تغییر Priority
    def test_04_change_priority(self):
        idea = self.db.create_idea("تغییر اولویت تست", priority="low")
        self.assertEqual(idea["priority"], "low")
        updated = self.db.change_priority(idea["id"], "high")
        self.assertEqual(updated["priority"], "high")
        # بررسی در دیتابیس
        fetched = self.db.get_idea_by_id(idea["id"])
        self.assertEqual(fetched["priority"], "high")

    # ۵. ویرایش
    def test_05_edit_idea(self):
        idea = self.db.create_idea("عنوان اولیه", "توضیح اولیه", "low")
        updated = self.db.update_idea(idea["id"], "عنوان ویرایش‌شده", "توضیح جدید", "medium")
        self.assertEqual(updated["title"], "عنوان ویرایش‌شده")
        self.assertEqual(updated["description"], "توضیح جدید")
        self.assertEqual(updated["priority"], "medium")

    # ۶. Search در عنوان و توضیحات
    def test_06_search_functionality(self):
        self.db.create_idea("یادگیری زبان پایتون", "تمرکز روی فلسفه کدنویسی", "high")
        self.db.create_idea("طراحی رابط کاربری", "استفاده از رنگ‌های تیره", "medium")
        self.db.create_idea("خرید کتاب فلسفه", "مطالعه عصرانه", "low")

        # جستجو بر اساس عنوان
        res1 = self.db.get_active_ideas(search_query="پایتون")
        self.assertEqual(len(res1), 1)
        self.assertEqual(res1[0]["title"], "یادگیری زبان پایتون")

        # جستجو بر اساس توضیحات
        res2 = self.db.get_active_ideas(search_query="فلسفه")
        self.assertEqual(len(res2), 2)  # هم در عنوان خرید کتاب و هم در توضیحات یادگیری پایتون

    # ۷. Pin و قانون حداکثر یک پین
    def test_07_pin_single_rule(self):
        i1 = self.db.create_idea("ایده اول", priority="low")
        i2 = self.db.create_idea("ایده دوم", priority="medium")

        self.db.set_focus_pin(i1["id"], True)
        self.assertEqual(self.db.get_idea_by_id(i1["id"])["is_focus_pinned"], 1)

        # پین کردن ایده دوم باید پین ایده اول را بردارد
        self.db.set_focus_pin(i2["id"], True)
        self.assertEqual(self.db.get_idea_by_id(i1["id"])["is_focus_pinned"], 0)
        self.assertEqual(self.db.get_idea_by_id(i2["id"])["is_focus_pinned"], 1)

    # ۸. الگوریتم Focus Mode
    def test_08_focus_mode_algorithm(self):
        # سناریو: ایده‌های با اولویت مختلف
        i_low = self.db.create_idea("ایده کم ۱", priority="low")
        time.sleep(0.01)
        i_med = self.db.create_idea("ایده متوسط ۱", priority="medium")
        time.sleep(0.01)
        i_high1 = self.db.create_idea("ایده زیاد ۱ (قدیمی‌تر)", priority="high")
        time.sleep(0.01)
        i_high2 = self.db.create_idea("ایده زیاد ۲ (جدیدتر)", priority="high")

        # بدون پین دستی: باید ایده زیاد ۱ (قدیمی‌تر) انتخاب شود
        focus = self.db.get_focus_idea()
        self.assertEqual(focus["id"], i_high1["id"])

        # اگر ایده کم پین شود: باید ایده کم به عنوان کانون تمرکز بیاید
        self.db.set_focus_pin(i_low["id"], True)
        focus_pinned = self.db.get_focus_idea()
        self.assertEqual(focus_pinned["id"], i_low["id"])

        # اگر ایده پین‌شده تکمیل شود: پین حذف شده و دوباره زیاد ۱ انتخاب می‌شود
        self.db.complete_idea(i_low["id"])
        focus_after_complete = self.db.get_focus_idea()
        self.assertEqual(focus_after_complete["id"], i_high1["id"])

    # ۹. Complete
    def test_09_complete_idea(self):
        idea = self.db.create_idea("ایده برای تکمیل", priority="high")
        completed = self.db.complete_idea(idea["id"])
        self.assertEqual(completed["status"], "completed")
        self.assertIsNotNone(completed["completed_at"])
        # نباید در ایده‌های فعال باشد
        active = self.db.get_active_ideas()
        self.assertEqual(len(active), 0)
        # باید در ایده‌های انجام‌شده باشد
        comp_list = self.db.get_completed_ideas()
        self.assertEqual(len(comp_list), 1)

    # ۱۰. Undo تکمیل
    def test_10_undo_completion(self):
        idea = self.db.create_idea("ایده آندو", "توضیح اولیه", "high")
        created_time = idea["created_at"]
        self.db.complete_idea(idea["id"])

        # اجرای Undo
        restored = self.db.undo_completion(idea["id"])
        self.assertEqual(restored["status"], "active")
        self.assertIsNone(restored["completed_at"])
        self.assertEqual(restored["created_at"], created_time)
        self.assertEqual(restored["priority"], "high")
        self.assertEqual(restored["title"], "ایده آندو")

    # ۱۱. Restore
    def test_11_restore_idea(self):
        idea = self.db.create_idea("ایده برای بازیابی", priority="medium")
        self.db.complete_idea(idea["id"])
        self.assertEqual(len(self.db.get_completed_ideas()), 1)

        restored = self.db.restore_idea(idea["id"])
        self.assertEqual(restored["status"], "active")
        self.assertEqual(len(self.db.get_completed_ideas()), 0)
        self.assertEqual(len(self.db.get_active_ideas()), 1)

    # ۱۲. Permanent Delete
    def test_12_permanent_delete(self):
        idea = self.db.create_idea("ایده برای حذف دائمی", priority="low")
        self.db.complete_idea(idea["id"])
        deleted = self.db.delete_idea_permanently(idea["id"])
        self.assertTrue(deleted)
        self.assertIsNone(self.db.get_idea_by_id(idea["id"]))

    # ۱۳. Refresh (بررسی واکشی تازه بدون کش مخفی)
    def test_13_refresh_simulation(self):
        self.db.create_idea("ایده ریفرش ۱", priority="high")
        # شبیه‌سازی درخواست تازه از دیتابیس
        fresh_fetch = self.db.get_active_ideas()
        self.assertEqual(len(fresh_fetch), 1)
        self.assertEqual(fresh_fetch[0]["title"], "ایده ریفرش ۱")

    # ۱۴ & ۱۵. Stop و Restart سرور و پایداری داده‌ها روی دیسک
    def test_14_15_stop_restart_and_persistence(self):
        self.db.create_idea("ایده ماندگار", "توضیح ماندگار", "high")
        # بستن کامل اتصال فعلی
        del self.db

        # ایجاد یک اتصال کاملاً جدید به همان فایل دیتابیس
        reopened_db = Database(self.TEST_DB_NAME)
        active = reopened_db.get_active_ideas()
        self.assertEqual(len(active), 1)
        self.assertEqual(active[0]["title"], "ایده ماندگار")
        self.assertEqual(active[0]["priority"], "high")
        self.db = reopened_db

    # ۱۶. Empty State
    def test_16_empty_state(self):
        self.assertEqual(len(self.db.get_active_ideas()), 0)
        self.assertEqual(len(self.db.get_completed_ideas()), 0)
        self.assertIsNone(self.db.get_focus_idea())
        stats = self.db.get_stats()
        self.assertEqual(stats["active"], 0)
        self.assertEqual(stats["completed"], 0)

    # ۱۷. ورودی خالی (Validation)
    def test_17_empty_input_validation(self):
        with self.assertRaises(ValueError):
            self.db.create_idea("    ")
        with self.assertRaises(ValueError):
            self.db.create_idea("")

    # ۱۸. عنوان طولانی
    def test_18_long_title(self):
        long_title = "الف" * 150
        idea = self.db.create_idea(long_title, priority="medium")
        self.assertEqual(idea["title"], long_title)

    # ۱۹. کلیک‌های سریع متوالی (Concurrent/Rapid Actions)
    def test_19_rapid_clicks_simulation(self):
        idea = self.db.create_idea("تست کلیک سریع", priority="low")
        # شبیه‌سازی ۱۰ بار تغییر اولویت پشت سر هم
        for p in ["high", "medium", "low", "high", "medium", "low"]:
            self.db.change_priority(idea["id"], p)
        final = self.db.get_idea_by_id(idea["id"])
        self.assertEqual(final["priority"], "low")

    # ۲۰. تست استرس ۱۰۰ ایده (Stress Test: 100 ideas + Search + Sort + Edit)
    def test_20_stress_test_100_ideas(self):
        print("\n--- اجرای آزمون تنش ۱۰۰ ایده ---")
        start_time = time.time()
        
        # درج ۱۰۰ ایده با اولویت‌های متناوب
        priorities = ["low", "medium", "high"]
        for i in range(1, 101):
            p = priorities[i % 3]
            desc = "توضیحات ایده مهم با برچسب خاص" if i == 77 else f"توضیحات برای ایده شماره {i}"
            self.db.create_idea(f"ایده آزمون تنش شماره {i}", desc, priority=p)

        insert_time = time.time() - start_time
        print(f"✓ درج ۱۰۰ ایده در {insert_time:.3f} ثانیه انجام شد.")

        # ۱. بررسی تعداد کل
        all_active = self.db.get_active_ideas()
        self.assertEqual(len(all_active), 100)

        # ۲. بررسی مرتب‌سازی: باید تمام highها اول باشند
        first_group_priority = all_active[0]["priority"]
        self.assertEqual(first_group_priority, "high")

        # ۳. تست جستجوی دقیق در ۱۰۰ ایده
        search_res = self.db.get_active_ideas(search_query="برچسب خاص")
        self.assertEqual(len(search_res), 1)
        target_idea = search_res[0]
        self.assertEqual(target_idea["title"], "ایده آزمون تنش شماره 77")

        # ۴. ویرایش ایده هدف
        updated_target = self.db.update_idea(target_idea["id"], "ایده ۷۷ ویرایش شد", "توضیحات نهایی", "high")
        self.assertEqual(updated_target["title"], "ایده ۷۷ ویرایش شد")

        # ۵. شبیه‌سازی ریفرش و راه‌اندازی مجدد دیتابیس
        del self.db
        reopened_db = Database(self.TEST_DB_NAME)
        rechecked = reopened_db.get_idea_by_id(target_idea["id"])
        self.assertEqual(rechecked["title"], "ایده ۷۷ ویرایش شد")
        self.assertEqual(rechecked["priority"], "high")
        self.db = reopened_db
        print("✓ آزمون استرس ۱۰۰ ایده و ماندگاری کامل با موفقیت پاس شد.")


if __name__ == "__main__":
    unittest.main()
