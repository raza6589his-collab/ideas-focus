/**
 * آداپتور ذخیره‌سازی محلی و مستقل (Offline Storage Engine)
 * برای اجرای صددرصد آفلاین روی سیستم‌عامل اندروید بدون نیاز به سرور پایتون.
 * تمامی رفتارهای بیزینس‌لاجیک database.py (ترتیب اولویت‌ها، فوکوس، پین، آندو و بایگانی)
 * را با سرعت بالا در حافظه محلی دستگاه پیاده‌سازی می‌کند.
 */

class OfflineStorageEngine {
    constructor() {
        this.STORAGE_KEY_IDEAS = 'ideas_focus_data_v1';
        this.STORAGE_KEY_SETTINGS = 'ideas_focus_settings_v1';
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(this.STORAGE_KEY_IDEAS)) {
            localStorage.setItem(this.STORAGE_KEY_IDEAS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEY_SETTINGS)) {
            localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify({}));
        }
    }

    _getIdeas() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY_IDEAS) || '[]');
        } catch {
            return [];
        }
    }

    _saveIdeas(ideas) {
        localStorage.setItem(this.STORAGE_KEY_IDEAS, JSON.stringify(ideas));
    }

    _getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY_SETTINGS) || '{}');
        } catch {
            return {};
        }
    }

    _saveSettings(settings) {
        localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }

    _nowIso() {
        return new Date().toISOString();
    }

    // بررسی اینکه آیا باید در حالت آفلاین کار کند یا خیر
    static isOfflineMode() {
        return (
            window.location.protocol === 'file:' ||
            navigator.userAgent.includes('IdeasFocusAndroid') ||
            window.location.hostname === 'localhost' && window.location.port === '' ||
            window.FORCE_OFFLINE_MODE === true
        );
    }

    // هدایت درخواست‌ها
    async handleRequest(endpoint, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        let body = {};
        if (options.body) {
            try {
                body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
            } catch {}
        }

        // تفکیک روت و پارامترها
        const [path, queryString] = endpoint.split('?');
        const params = new URLSearchParams(queryString || '');

        // 1. GET /api/stats
        if (path === '/api/stats' && method === 'GET') {
            const ideas = this._getIdeas();
            const active = ideas.filter(i => i.status === 'active');
            const completed = ideas.filter(i => i.status === 'completed');
            const high = active.filter(i => i.priority === 'high');
            return {
                success: true,
                message: 'آمار با موفقیت واکشی شد',
                data: {
                    active_count: active.length,
                    completed_count: completed.length,
                    high_priority_count: high.length,
                    focus_available: active.length > 0
                }
            };
        }

        // 2. GET /api/ideas/focus
        if (path === '/api/ideas/focus' && method === 'GET') {
            const focus = this.getFocusIdea();
            return {
                success: true,
                message: focus ? 'ایده کانون تمرکز یافت شد' : 'هیچ ایده‌ای برای تمرکز وجود ندارد',
                data: { idea: focus }
            };
        }

        // 3. GET /api/ideas
        if (path === '/api/ideas' && method === 'GET') {
            const status = params.get('status') || 'active';
            const search = params.get('search') || '';
            const priority = params.get('priority') || '';
            const list = this.getIdeas(status, search, priority);
            return {
                success: true,
                message: 'لیست ایده‌ها با موفقیت دریافت شد',
                data: { ideas: list, total_count: list.length }
            };
        }

        // 4. POST /api/ideas (ایجاد ایده)
        if (path === '/api/ideas' && method === 'POST') {
            const title = (body.title || '').trim();
            if (!title) {
                return { success: false, message: 'عنوان ایده نمی‌تواند خالی باشد.' };
            }
            const priority = ['high', 'medium', 'low'].includes(body.priority) ? body.priority : 'medium';
            const idea = this.createIdea(title, body.description || '', priority);
            return { success: true, message: 'ایده با موفقیت ذخیره شد.', data: idea };
        }

        // 5. POST /api/ideas/<id>/complete
        const completeMatch = path.match(/^\/api\/ideas\/(\d+)\/complete$/);
        if (completeMatch && method === 'POST') {
            const id = parseInt(completeMatch[1], 10);
            const res = this.completeIdea(id);
            return {
                success: !!res,
                message: res ? 'ایده با موفقیت تکمیل شد.' : 'ایده یافت نشد.',
                data: res
            };
        }

        // 6. POST /api/ideas/<id>/undo
        const undoMatch = path.match(/^\/api\/ideas\/(\d+)\/undo$/);
        if (undoMatch && method === 'POST') {
            const id = parseInt(undoMatch[1], 10);
            const res = this.undoCompletion(id);
            return {
                success: !!res,
                message: res ? 'تکمیل ایده با موفقیت لغو شد.' : 'ایده یافت نشد.',
                data: res
            };
        }

        // 7. POST /api/ideas/<id>/restore
        const restoreMatch = path.match(/^\/api\/ideas\/(\d+)\/restore$/);
        if (restoreMatch && method === 'POST') {
            const id = parseInt(restoreMatch[1], 10);
            const res = this.restoreIdea(id);
            return {
                success: !!res,
                message: res ? 'ایده با موفقیت به لیست فعال بازگردانده شد.' : 'ایده یافت نشد.',
                data: res
            };
        }

        // 8. POST /api/ideas/<id>/pin
        const pinMatch = path.match(/^\/api\/ideas\/(\d+)\/pin$/);
        if (pinMatch && method === 'POST') {
            const id = parseInt(pinMatch[1], 10);
            const isPinned = body.pinned !== undefined ? !!body.pinned : true;
            const res = this.setPin(id, isPinned);
            return {
                success: !!res,
                message: isPinned ? 'ایده با موفقیت پین شد.' : 'پین ایده برداشته شد.',
                data: res
            };
        }

        // 9. PUT /api/ideas/<id>
        const updateMatch = path.match(/^\/api\/ideas\/(\d+)$/);
        if (updateMatch && method === 'PUT') {
            const id = parseInt(updateMatch[1], 10);
            const res = this.updateIdea(id, body.title, body.description, body.priority);
            return {
                success: !!res,
                message: res ? 'ایده با موفقیت به‌روزرسانی شد.' : 'ایده یافت نشد.',
                data: res
            };
        }

        // 10. DELETE /api/ideas/<id>
        if (updateMatch && method === 'DELETE') {
            const id = parseInt(updateMatch[1], 10);
            const hard = params.get('hard') === 'true';
            const res = this.deleteIdea(id, hard);
            return {
                success: res,
                message: res ? 'ایده با موفقیت حذف شد.' : 'ایده یافت نشد.'
            };
        }

        // 11. Settings
        if (path === '/api/settings') {
            if (method === 'GET') {
                const key = params.get('key');
                const settings = this._getSettings();
                return { success: true, data: { key, value: settings[key] || null } };
            }
            if (method === 'POST') {
                const settings = this._getSettings();
                if (body.key) {
                    settings[body.key] = body.value;
                    this._saveSettings(settings);
                }
                return { success: true, message: 'تنظیم با موفقیت ذخیره شد.' };
            }
        }

        // 12. Check update
        if (path === '/api/check-update') {
            try {
                const res = await fetch('https://api.github.com/repos/raza6589his-collab/ideas-focus/releases/latest');
                if (res.ok) {
                    const data = await res.json();
                    const tag = (data.tag_name || '').replace(/^v/, '');
                    const current = '1.1.0';
                    const isNewer = tag > current;
                    return {
                        success: true,
                        data: {
                            update_available: isNewer,
                            latest_version: tag,
                            current_version: current,
                            release_url: data.html_url
                        }
                    };
                }
            } catch {}
            return { success: true, data: { update_available: false, current_version: '1.1.0' } };
        }

        return { success: false, message: 'مسیر نامعتبر است' };
    }

    // --- توابع پیاده‌سازی منطق بیزینس لاجیک دقیقاً مطابق database.py ---

    createIdea(title, description = '', priority = 'medium') {
        const ideas = this._getIdeas();
        const nextId = ideas.length > 0 ? Math.max(...ideas.map(i => i.id || 0)) + 1 : 1;
        const now = this._nowIso();

        const newIdea = {
            id: nextId,
            title: title.trim(),
            description: (description || '').trim(),
            priority: priority,
            status: 'active',
            is_pinned: 0,
            created_at: now,
            completed_at: null,
            updated_at: now
        };

        ideas.push(newIdea);
        this._saveIdeas(ideas);
        return newIdea;
    }

    getIdeas(status = 'active', searchQuery = '', priorityFilter = '') {
        let ideas = this._getIdeas().filter(i => i.status === status);

        if (priorityFilter && ['high', 'medium', 'low'].includes(priorityFilter)) {
            ideas = ideas.filter(i => i.priority === priorityFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            ideas = ideas.filter(i =>
                (i.title && i.title.toLowerCase().includes(q)) ||
                (i.description && i.description.toLowerCase().includes(q))
            );
        }

        if (status === 'active') {
            // ترتیب دقیق: پین‌شده‌ها اول -> سپس اولویت (High -> Medium -> Low) -> سپس قدیمی‌ترین به جدیدترین
            const priorityWeight = { high: 1, medium: 2, low: 3 };
            ideas.sort((a, b) => {
                const pinDiff = (b.is_pinned || 0) - (a.is_pinned || 0);
                if (pinDiff !== 0) return pinDiff;

                const pA = priorityWeight[a.priority] || 99;
                const pB = priorityWeight[b.priority] || 99;
                if (pA !== pB) return pA - pB;

                return new Date(a.created_at) - new Date(b.created_at);
            });
        } else if (status === 'completed') {
            // جدیدترین تکمیل‌شده‌ها در ابتدا
            ideas.sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
        }

        return ideas;
    }

    getFocusIdea() {
        const activeIdeas = this.getIdeas('active');
        if (activeIdeas.length === 0) return null;

        // اگر ایده پین‌شده وجود دارد، همان است
        const pinned = activeIdeas.find(i => i.is_pinned === 1);
        if (pinned) return pinned;

        // در غیر این صورت، طبق مرتب‌سازی رسمی اولین ایده فعال (قدیمی‌ترین High، سپس Medium، سپس Low)
        return activeIdeas[0];
    }

    setPin(ideaId, isPinned) {
        const ideas = this._getIdeas();
        const target = ideas.find(i => i.id === ideaId);
        if (!target) return null;

        // قانون صریح محصول: در هر لحظه حداکثر فقط یک ایده می‌تواند پین باشد
        if (isPinned) {
            ideas.forEach(i => { i.is_pinned = 0; });
            target.is_pinned = 1;
        } else {
            target.is_pinned = 0;
        }

        target.updated_at = this._nowIso();
        this._saveIdeas(ideas);
        return target;
    }

    completeIdea(ideaId) {
        const ideas = this._getIdeas();
        const target = ideas.find(i => i.id === ideaId);
        if (!target) return null;

        target.status = 'completed';
        target.is_pinned = 0; // لغو خودکار پین هنگام تکمیل
        target.completed_at = this._nowIso();
        target.updated_at = this._nowIso();
        this._saveIdeas(ideas);
        return target;
    }

    undoCompletion(ideaId) {
        const ideas = this._getIdeas();
        const target = ideas.find(i => i.id === ideaId);
        if (!target) return null;

        target.status = 'active';
        target.completed_at = null;
        target.updated_at = this._nowIso();
        this._saveIdeas(ideas);
        return target;
    }

    restoreIdea(ideaId) {
        return this.undoCompletion(ideaId);
    }

    updateIdea(ideaId, title, description, priority) {
        const ideas = this._getIdeas();
        const target = ideas.find(i => i.id === ideaId);
        if (!target) return null;

        if (title !== undefined) target.title = title.trim();
        if (description !== undefined) target.description = (description || '').trim();
        if (priority && ['high', 'medium', 'low'].includes(priority)) target.priority = priority;

        target.updated_at = this._nowIso();
        this._saveIdeas(ideas);
        return target;
    }

    deleteIdea(ideaId, hard = false) {
        let ideas = this._getIdeas();
        const index = ideas.findIndex(i => i.id === ideaId);
        if (index === -1) return false;

        ideas.splice(index, 1);
        this._saveIdeas(ideas);
        return true;
    }
}

// ایجاد نمونه سراسری آداپتور
window.offlineStorage = new OfflineStorageEngine();
