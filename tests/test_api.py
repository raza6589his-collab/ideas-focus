"""
آزمون اعتبارسنجی اندپوینت‌های Flask RESTful API
"""

import json
import os
import sys
import unittest

# افزودن ریشه پروژه به مسیر ماژول‌ها
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ["IDEAS_DB_PATH"] = os.path.join(os.path.dirname(__file__), "test_temp_api.db")

from app import app
from database import Database

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.test_db_path = os.path.join(os.path.dirname(__file__), "test_api_ideas.db")
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except Exception:
                pass
        self.db = Database(self.test_db_path)
        import app as app_module
        app_module.db = self.db
        self.client = app.test_client()

    def tearDown(self):
        del self.db
        import gc
        gc.collect()
        for ext in ["", "-wal", "-shm"]:
            f = self._get_db_path(ext)
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass

    def _get_db_path(self, ext):
        return self.test_db_path + ext

    def test_create_idea_api(self):
        res = self.client.post('/api/ideas', json={"title": "ایده تستی API", "priority": "high"})
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["title"], "ایده تستی API")
        self.assertEqual(data["data"]["priority"], "high")

    def test_create_idea_empty_api(self):
        res = self.client.post('/api/ideas', json={"title": "   "})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])

    def test_complete_and_undo_api(self):
        # ساخت ایده
        res1 = self.client.post('/api/ideas', json={"title": "ایده برای تست آندو"})
        idea_id = res1.get_json()["data"]["id"]

        # تکمیل ایده
        res2 = self.client.post(f'/api/ideas/{idea_id}/complete')
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.get_json()["data"]["status"], "completed")

        # آندو
        res3 = self.client.post(f'/api/ideas/{idea_id}/undo')
        self.assertEqual(res3.status_code, 200)
        self.assertEqual(res3.get_json()["data"]["status"], "active")
        self.assertIsNone(res3.get_json()["data"]["completed_at"])

    def test_priority_patch_api(self):
        res1 = self.client.post('/api/ideas', json={"title": "ایده اولویت"})
        idea_id = res1.get_json()["data"]["id"]

        res2 = self.client.patch(f'/api/ideas/{idea_id}/priority', json={"priority": "high"})
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.get_json()["data"]["priority"], "high")

    def test_focus_api(self):
        self.client.post('/api/ideas', json={"title": "ایده کم", "priority": "low"})
        self.client.post('/api/ideas', json={"title": "ایده زیاد", "priority": "high"})

        res = self.client.get('/api/ideas/focus')
        self.assertEqual(res.status_code, 200)
        focus_idea = res.get_json()["data"]["idea"]
        self.assertEqual(focus_idea["priority"], "high")
        self.assertEqual(focus_idea["title"], "ایده زیاد")

    def test_delete_api(self):
        res1 = self.client.post('/api/ideas', json={"title": "ایده حذف"})
        idea_id = res1.get_json()["data"]["id"]

        res2 = self.client.delete(f'/api/ideas/{idea_id}')
        self.assertEqual(res2.status_code, 200)

        # واکشی مجدد باید 404 بدهد
        res3 = self.client.get(f'/api/ideas/{idea_id}')
        self.assertEqual(res3.status_code, 404)

if __name__ == "__main__":
    unittest.main()
