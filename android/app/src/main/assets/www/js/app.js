/**
 * برنامه مدیریت و تمرکز بر ایده‌ها (Ideas & Focus Engine)
 * جاوااسکریپت بازطراحی‌شده، مینیمال، بدون وابستگی‌های خارجی (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- وضعیت سراسری برنامه (State) ---
    const state = {
        activeTab: 'activeTab',
        activeFilter: 'all',
        activeSearchQuery: '',
        completedSearchQuery: '',
        activeIdeas: [],
        completedIdeas: [],
        focusIdea: null,
        stats: { active: 0, completed: 0, high_priority: 0 },
        undoTimeoutId: null,
        undoIdeaId: null,
        theme: 'dark'
    };

    // --- ارجاعات به المان‌های DOM ---
    const dom = {
        // سربرگ و تم
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        themeSvg: document.getElementById('themeSvg'),
        statActiveCount: document.getElementById('statActiveCount'),
        statHighCount: document.getElementById('statHighCount'),
        statCompletedCount: document.getElementById('statCompletedCount'),
        activeBadge: document.getElementById('activeBadge'),
        completedBadge: document.getElementById('completedBadge'),

        // تب‌ها
        tabButtons: document.querySelectorAll('.nav-tab'),
        tabContents: document.querySelectorAll('.tab-content'),

        // ثبت سریع ایده
        quickCaptureForm: document.getElementById('quickCaptureForm'),
        quickTitleInput: document.getElementById('quickTitleInput'),
        toggleDescBtn: document.getElementById('toggleDescBtn'),
        toggleDescIcon: document.getElementById('toggleDescIcon'),
        captureDetails: document.getElementById('captureDetails'),
        quickDescInput: document.getElementById('quickDescInput'),

        // جستجو و فیلتر
        activeSearchInput: document.getElementById('activeSearchInput'),
        clearActiveSearch: document.getElementById('clearActiveSearch'),
        filterPills: document.querySelectorAll('[data-priority-filter]'),
        completedSearchInput: document.getElementById('completedSearchInput'),
        clearCompletedSearch: document.getElementById('clearCompletedSearch'),
        completedCountText: document.getElementById('completedCountText'),

        // کانتینرهای لیست و Empty States
        activeIdeasContainer: document.getElementById('activeIdeasContainer'),
        activeEmptyState: document.getElementById('activeEmptyState'),
        completedIdeasContainer: document.getElementById('completedIdeasContainer'),
        completedEmptyState: document.getElementById('completedEmptyState'),

        // کانون تمرکز
        focusCard: document.getElementById('focusCard'),
        focusEmptyState: document.getElementById('focusEmptyState'),
        focusGoToActiveBtn: document.getElementById('focusGoToActiveBtn'),

        // مودال ویرایش
        editModal: document.getElementById('editModal'),
        editIdeaForm: document.getElementById('editIdeaForm'),
        editIdeaId: document.getElementById('editIdeaId'),
        editTitleInput: document.getElementById('editTitleInput'),
        editDescInput: document.getElementById('editDescInput'),
        closeEditModalBtn: document.getElementById('closeEditModalBtn'),
        cancelEditBtn: document.getElementById('cancelEditBtn'),

        // مودال حذف
        deleteModal: document.getElementById('deleteModal'),
        deleteIdeaTitle: document.getElementById('deleteIdeaTitle'),
        closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

        // اعلان موقت و بازگردانی (Undo)
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        toastUndoBtn: document.getElementById('toastUndoBtn'),
        toastProgress: document.getElementById('toastProgress')
    };

    let ideaIdToDelete = null;

    // ================= توابع کمکی ارتباط با API (با پشتیبانی هوشمند آفلاین اندروید) =================
    async function apiRequest(url, options = {}) {
        // در صورت اجرای مستقل در اندروید یا پروتکل محلی
        if (window.offlineStorage && OfflineStorageEngine.isOfflineMode()) {
            try {
                return await window.offlineStorage.handleRequest(url, options);
            } catch (err) {
                console.error('Offline Storage Error:', err);
                showErrorToast(err.message || 'خطا در عملیات حافظه محلی دستگاه.');
                throw err;
            }
        }

        try {
            const res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                ...options
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'خطایی در ارتباط با سرور رخ داد.');
            }
            return data;
        } catch (err) {
            // در صورت عدم دسترسی به سرور پایتون در گوشی همراه، سوئیچ خودکار به حافظه محلی
            if (window.offlineStorage) {
                console.warn('سرور در دسترس نیست، استفاده از حافظه محلی دستگاه...');
                try {
                    return await window.offlineStorage.handleRequest(url, options);
                } catch (fallbackErr) {
                    console.error('Fallback Error:', fallbackErr);
                }
            }
            console.error('API Error:', err);
            showErrorToast(err.message || 'خطا در برقراری ارتباط با سیستم.');
            throw err;
        }
    }

    // ================= فرمت زمانی و تاریخ به فارسی =================
    function formatDateTime(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(date);
        } catch (e) {
            return isoString;
        }
    }

    function formatRelativeTime(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffSec = Math.floor((now - date) / 1000);

            if (diffSec < 60) return 'همین حالا';
            if (diffSec < 3600) return `${Math.floor(diffSec / 60)} دقیقه پیش`;
            if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ساعت پیش`;
            if (diffSec < 172800) return 'دیروز';
            return formatDateTime(isoString);
        } catch (e) {
            return formatDateTime(isoString);
        }
    }

    // ================= بارگذاری داده‌ها از پایگاه‌داده SQLite =================
    async function loadActiveIdeas() {
        try {
            let url = `/api/ideas?status=active`;
            if (state.activeSearchQuery) {
                url += `&q=${encodeURIComponent(state.activeSearchQuery)}`;
            }
            const res = await apiRequest(url);
            state.activeIdeas = res.data.ideas || [];
            updateStats(res.data.stats);
            renderActiveIdeas();
        } catch (e) {}
    }

    async function loadCompletedIdeas() {
        try {
            let url = `/api/ideas?status=completed`;
            if (state.completedSearchQuery) {
                url += `&q=${encodeURIComponent(state.completedSearchQuery)}`;
            }
            const res = await apiRequest(url);
            state.completedIdeas = res.data.ideas || [];
            renderCompletedIdeas();
        } catch (e) {}
    }

    async function loadFocusIdea() {
        try {
            const res = await apiRequest('/api/ideas/focus');
            state.focusIdea = res.data.idea;
            updateStats(res.data.stats);
            renderFocusMode();
        } catch (e) {}
    }

    function updateStats(stats) {
        if (!stats) return;
        state.stats = stats;
        dom.statActiveCount.textContent = Number(stats.active).toLocaleString('fa-IR');
        dom.statHighCount.textContent = Number(stats.high_priority).toLocaleString('fa-IR');
        dom.statCompletedCount.textContent = Number(stats.completed).toLocaleString('fa-IR');
        dom.activeBadge.textContent = Number(stats.active).toLocaleString('fa-IR');
        dom.completedBadge.textContent = Number(stats.completed).toLocaleString('fa-IR');
        dom.completedCountText.textContent = `${Number(stats.completed).toLocaleString('fa-IR')} ایده با موفقیت به سرانجام رسیده و بایگانی شده است.`;
    }

    // ================= رندر سطرهای سرمقاله‌ای ایده‌های فعال =================
    function renderActiveIdeas() {
        dom.activeIdeasContainer.innerHTML = '';

        let filtered = state.activeIdeas;
        if (state.activeFilter !== 'all') {
            filtered = filtered.filter(idea => idea.priority === state.activeFilter);
        }

        if (filtered.length === 0) {
            dom.activeEmptyState.style.display = 'flex';
            return;
        }

        dom.activeEmptyState.style.display = 'none';

        filtered.forEach(idea => {
            const row = createActiveIdeaRow(idea);
            dom.activeIdeasContainer.appendChild(row);
        });
    }

    function createActiveIdeaRow(idea) {
        const row = document.createElement('div');
        row.className = `editorial-row priority-${idea.priority} ${idea.is_focus_pinned ? 'is-pinned' : ''}`;
        row.dataset.id = idea.id;

        const priorityNames = {
            'high': 'زیاد',
            'medium': 'متوسط',
            'low': 'کم'
        };

        const pinBadgeHtml = idea.is_focus_pinned 
            ? `<span class="pin-tag" title="سنجاق‌شده به عنوان کانون تمرکز اصلی"><svg class="svg-icon-xs"><use href="#icon-pin"></use></svg> سنجاق تمرکز</span>` 
            : '';

        const descHtml = idea.description 
            ? `<div class="row-desc">${escapeHtml(idea.description)}</div>` 
            : '';

        row.innerHTML = `
            <button type="button" class="row-check-btn" title="علامت‌گذاری به عنوان انجام‌شده" aria-label="تکمیل ایده">
                <svg class="svg-icon-sm check-svg"><use href="#icon-check"></use></svg>
            </button>

            <div class="row-main">
                <div class="row-title-line">
                    <span class="row-title">${escapeHtml(idea.title)}</span>
                    ${pinBadgeHtml}
                </div>
                ${descHtml}
                <div class="row-meta">
                    <button type="button" class="meta-priority-indicator priority-${idea.priority}" title="کلیک برای تغییر اولویت" data-action="cycle-priority">
                        <span class="dot dot-${idea.priority}"></span>
                        اولویت ${priorityNames[idea.priority] || idea.priority}
                    </button>
                    <span class="meta-bullet">·</span>
                    <span class="meta-time">${formatRelativeTime(idea.created_at)}</span>
                </div>
            </div>

            <div class="row-actions">
                <button type="button" class="row-action-btn focus-action" data-action="focus" title="تمرکز روی این ایده">
                    <svg class="svg-icon-xs"><use href="#icon-target"></use></svg>
                    <span>تمرکز</span>
                </button>
                <button type="button" class="row-action-btn edit-action" data-action="edit" title="ویرایش">
                    <svg class="svg-icon-xs"><use href="#icon-edit"></use></svg>
                </button>
            </div>
        `;

        // رویداد تیک تکمیل
        const checkBtn = row.querySelector('.row-check-btn');
        checkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleCompleteIdea(idea.id, row);
        });

        // تغییر مستقیم اولویت با کلیک
        const priorityBtn = row.querySelector('[data-action="cycle-priority"]');
        priorityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cyclePriority(idea);
        });

        // اکشن ورود به فوکوس
        const focusBtn = row.querySelector('[data-action="focus"]');
        focusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pinAndGoToFocus(idea.id);
        });

        // اکشن ویرایش
        const editBtn = row.querySelector('[data-action="edit"]');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(idea);
        });

        return row;
    }

    // ================= رندر بایگانی ایده‌های انجام‌شده =================
    function renderCompletedIdeas() {
        dom.completedIdeasContainer.innerHTML = '';

        if (state.completedIdeas.length === 0) {
            dom.completedEmptyState.style.display = 'flex';
            return;
        }

        dom.completedEmptyState.style.display = 'none';

        state.completedIdeas.forEach(idea => {
            const row = createCompletedIdeaRow(idea);
            dom.completedIdeasContainer.appendChild(row);
        });
    }

    function createCompletedIdeaRow(idea) {
        const row = document.createElement('div');
        row.className = `editorial-row completed-row priority-${idea.priority}`;
        row.dataset.id = idea.id;

        const priorityNames = {
            'high': 'زیاد',
            'medium': 'متوسط',
            'low': 'کم'
        };

        const descHtml = idea.description 
            ? `<div class="row-desc">${escapeHtml(idea.description)}</div>` 
            : '';

        const completedDateText = idea.completed_at ? `انجام شد: ${formatDateTime(idea.completed_at)}` : '';

        row.innerHTML = `
            <div class="completed-check-icon" aria-hidden="true">
                <svg class="svg-icon-sm"><use href="#icon-check"></use></svg>
            </div>

            <div class="row-main">
                <div class="row-title-line">
                    <span class="row-title">${escapeHtml(idea.title)}</span>
                </div>
                ${descHtml}
                <div class="row-meta">
                    <span class="meta-priority-indicator priority-${idea.priority}">
                        <span class="dot dot-${idea.priority}"></span>
                        اولویت ${priorityNames[idea.priority] || idea.priority}
                    </span>
                    <span class="meta-bullet">·</span>
                    <span class="meta-time">${completedDateText}</span>
                </div>
            </div>

            <div class="row-actions">
                <button type="button" class="row-action-btn restore-action" data-action="restore" title="بازگردانی به لیست ایده‌های در حال انجام">
                    <svg class="svg-icon-xs"><use href="#icon-restore"></use></svg>
                    <span>برگرداندن</span>
                </button>
                <button type="button" class="row-action-btn delete-action" data-action="delete" title="حذف دائمی از پایگاه‌داده">
                    <svg class="svg-icon-xs"><use href="#icon-trash"></use></svg>
                </button>
            </div>
        `;

        // اکشن بازگردانی
        const restoreBtn = row.querySelector('[data-action="restore"]');
        restoreBtn.addEventListener('click', () => handleRestoreIdea(idea.id));

        // اکشن حذف دائمی
        const deleteBtn = row.querySelector('[data-action="delete"]');
        deleteBtn.addEventListener('click', () => openDeleteModal(idea));

        return row;
    }

    // ================= رندر کانون تمرکز (Focus Sanctuary) =================
    function renderFocusMode() {
        const idea = state.focusIdea;

        if (!idea) {
            dom.focusCard.style.display = 'none';
            dom.focusEmptyState.style.display = 'flex';
            return;
        }

        dom.focusEmptyState.style.display = 'none';
        dom.focusCard.style.display = 'flex';

        const priorityLabels = {
            'high': 'اولویت زیاد',
            'medium': 'اولویت متوسط',
            'low': 'اولویت کم'
        };

        const descHtml = idea.description 
            ? `<div class="focus-note-box">${escapeHtml(idea.description)}</div>` 
            : '';

        const pinBtnText = idea.is_focus_pinned ? 'سنجاق تمرکز برداشته شود' : 'سنجاق به عنوان تمرکز اصلی';

        dom.focusCard.innerHTML = `
            <div class="focus-top-meta">
                <span class="meta-priority-indicator priority-${idea.priority}">
                    <span class="dot dot-${idea.priority}"></span>
                    ${priorityLabels[idea.priority] || idea.priority}
                </span>
                <span class="focus-created-date">ثبت شده در: ${formatDateTime(idea.created_at)}</span>
            </div>

            <h2 class="focus-headline">${escapeHtml(idea.title)}</h2>

            ${descHtml}

            <div class="focus-action-group">
                <button type="button" class="btn-focus-primary" id="focusCompleteBtn">
                    <svg class="svg-icon"><use href="#icon-check"></use></svg>
                    <span>این ایده انجام شد</span>
                </button>

                <div class="focus-secondary-actions">
                    <button type="button" class="btn-focus-sec" id="focusTogglePinBtn">
                        <svg class="svg-icon-xs"><use href="#icon-pin"></use></svg>
                        <span>${pinBtnText}</span>
                    </button>

                    <button type="button" class="btn-focus-sec" id="focusExitBtn">
                        <svg class="svg-icon-xs"><use href="#icon-arrow-right"></use></svg>
                        <span>بازگشت به فهرست</span>
                    </button>
                </div>
            </div>
        `;

        // رویداد تکمیل ایده در فوکوس
        document.getElementById('focusCompleteBtn').addEventListener('click', () => {
            handleCompleteIdeaFromFocus(idea.id);
        });

        // رویداد سنجاق / عدم سنجاق
        document.getElementById('focusTogglePinBtn').addEventListener('click', async () => {
            try {
                await apiRequest(`/api/ideas/${idea.id}/pin`, {
                    method: 'POST',
                    body: JSON.stringify({ pinned: !idea.is_focus_pinned })
                });
                await loadFocusIdea();
                await loadActiveIdeas();
            } catch (e) {}
        });

        // رویداد خروج از کانون تمرکز
        document.getElementById('focusExitBtn').addEventListener('click', () => {
            switchTab('activeTab');
        });
    }

    // ================= تعاملات و منطق محصول =================

    // ثبت سریع ایده
    dom.quickCaptureForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = dom.quickTitleInput.value.trim();
        if (!title) return;

        const description = dom.quickDescInput.value.trim();
        const priorityInput = dom.quickCaptureForm.querySelector('input[name="quickPriority"]:checked');
        const priority = priorityInput ? priorityInput.value : 'medium';

        try {
            await apiRequest('/api/ideas', {
                method: 'POST',
                body: JSON.stringify({ title, description, priority })
            });

            // ریست کادر و آماده‌سازی برای ثبت ایده بعدی
            dom.quickTitleInput.value = '';
            dom.quickDescInput.value = '';
            dom.captureDetails.classList.remove('open');
            dom.toggleDescIcon.textContent = '+';
            dom.quickTitleInput.focus();

            await loadActiveIdeas();
        } catch (err) {}
    });

    // باز و بسته کردن توضیحات اختیاری در ثبت
    dom.toggleDescBtn.addEventListener('click', () => {
        const isOpen = dom.captureDetails.classList.toggle('open');
        dom.toggleDescIcon.textContent = isOpen ? '−' : '+';
        if (isOpen) {
            dom.quickDescInput.focus();
        }
    });

    // تغییر مستقیم اولویت روی ردیف ایده
    async function cyclePriority(idea) {
        const priorityOrder = ['high', 'medium', 'low'];
        const currentIndex = priorityOrder.indexOf(idea.priority);
        const nextPriority = priorityOrder[(currentIndex + 1) % priorityOrder.length];

        try {
            await apiRequest(`/api/ideas/${idea.id}/priority`, {
                method: 'PATCH',
                body: JSON.stringify({ priority: nextPriority })
            });
            await loadActiveIdeas();
            if (state.activeTab === 'focusTab') {
                await loadFocusIdea();
            }
        } catch (e) {}
    }

    // سنجاق و ورود مستقیم به کانون تمرکز
    async function pinAndGoToFocus(ideaId) {
        try {
            await apiRequest(`/api/ideas/${ideaId}/pin`, {
                method: 'POST',
                body: JSON.stringify({ pinned: true })
            });
            switchTab('focusTab');
        } catch (e) {}
    }

    // تکمیل ایده با ترنزیشن ملایم و Toast با Undo ۵ ثانیه‌ای
    async function handleCompleteIdea(ideaId, rowElement) {
        if (rowElement) {
            rowElement.classList.add('is-completing');
        }

        setTimeout(async () => {
            try {
                await apiRequest(`/api/ideas/${ideaId}/complete`, { method: 'POST' });
                showUndoToast(ideaId);
                await loadActiveIdeas();
                await loadCompletedIdeas();
            } catch (err) {
                if (rowElement) rowElement.classList.remove('is-completing');
            }
        }, 180);
    }

    // تکمیل ایده از داخل Focus Mode و انتخاب ایده بعدی
    async function handleCompleteIdeaFromFocus(ideaId) {
        try {
            await apiRequest(`/api/ideas/${ideaId}/complete`, { method: 'POST' });
            showUndoToast(ideaId);
            await loadFocusIdea();
            await loadActiveIdeas();
            await loadCompletedIdeas();
        } catch (err) {}
    }

    // بازیابی ایده از تب انجام‌شده
    async function handleRestoreIdea(ideaId) {
        try {
            await apiRequest(`/api/ideas/${ideaId}/restore`, { method: 'POST' });
            await loadCompletedIdeas();
            await loadActiveIdeas();
        } catch (err) {}
    }

    // ================= سیستم Toast اعلان با دکمه Undo و تایمر ۵ ثانیه‌ای =================
    function showUndoToast(ideaId) {
        clearUndoTimer();
        state.undoIdeaId = ideaId;

        dom.toastMessage.textContent = 'ایده با موفقیت به پایان رسید و بایگانی شد.';
        dom.toast.style.display = 'flex';

        // انیمیشن خط تایمر ۵ ثانیه‌ای
        dom.toastProgress.style.transition = 'none';
        dom.toastProgress.style.width = '100%';

        setTimeout(() => {
            dom.toastProgress.style.transition = 'width 5000ms linear';
            dom.toastProgress.style.width = '0%';
        }, 30);

        state.undoTimeoutId = setTimeout(() => {
            hideToast();
        }, 5000);
    }

    function clearUndoTimer() {
        if (state.undoTimeoutId) {
            clearTimeout(state.undoTimeoutId);
            state.undoTimeoutId = null;
        }
        state.undoIdeaId = null;
    }

    function hideToast() {
        dom.toast.style.display = 'none';
        clearUndoTimer();
    }

    dom.toastUndoBtn.addEventListener('click', async () => {
        const idToUndo = state.undoIdeaId;
        if (!idToUndo) return;

        hideToast();
        try {
            await apiRequest(`/api/ideas/${idToUndo}/undo`, { method: 'POST' });
            await loadActiveIdeas();
            await loadCompletedIdeas();
            if (state.activeTab === 'focusTab') {
                await loadFocusIdea();
            }
        } catch (err) {}
    });

    function showErrorToast(msg) {
        dom.toastMessage.textContent = msg;
        dom.toastUndoBtn.style.display = 'none';
        dom.toastProgress.style.backgroundColor = 'var(--priority-high)';
        dom.toast.style.display = 'flex';
        setTimeout(() => {
            dom.toast.style.display = 'none';
            dom.toastUndoBtn.style.display = 'inline-block';
            dom.toastProgress.style.backgroundColor = 'var(--accent-line)';
        }, 3500);
    }

    // ================= مودال ویرایش ایده =================
    function openEditModal(idea) {
        dom.editIdeaId.value = idea.id;
        dom.editTitleInput.value = idea.title;
        dom.editDescInput.value = idea.description || '';
        
        const radio = dom.editIdeaForm.querySelector(`input[name="editPriority"][value="${idea.priority}"]`);
        if (radio) radio.checked = true;

        dom.editModal.style.display = 'flex';
        dom.editTitleInput.focus();
    }

    function closeEditModal() {
        dom.editModal.style.display = 'none';
    }

    dom.closeEditModalBtn.addEventListener('click', closeEditModal);
    dom.cancelEditBtn.addEventListener('click', closeEditModal);

    dom.editIdeaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ideaId = dom.editIdeaId.value;
        const title = dom.editTitleInput.value.trim();
        if (!title) return;

        const description = dom.editDescInput.value.trim() || null;
        const priorityInput = dom.editIdeaForm.querySelector('input[name="editPriority"]:checked');
        const priority = priorityInput ? priorityInput.value : 'medium';

        try {
            await apiRequest(`/api/ideas/${ideaId}`, {
                method: 'PUT',
                body: JSON.stringify({ title, description, priority })
            });
            closeEditModal();
            await loadActiveIdeas();
            if (state.activeTab === 'focusTab') {
                await loadFocusIdea();
            }
        } catch (err) {}
    });

    // ================= مودال تأیید حذف دائمی =================
    function openDeleteModal(idea) {
        ideaIdToDelete = idea.id;
        dom.deleteIdeaTitle.textContent = idea.title;
        dom.deleteModal.style.display = 'flex';
    }

    function closeDeleteModal() {
        ideaIdToDelete = null;
        dom.deleteModal.style.display = 'none';
    }

    dom.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    dom.cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    dom.confirmDeleteBtn.addEventListener('click', async () => {
        if (!ideaIdToDelete) return;
        try {
            await apiRequest(`/api/ideas/${ideaIdToDelete}`, { method: 'DELETE' });
            closeDeleteModal();
            await loadCompletedIdeas();
            await loadActiveIdeas();
        } catch (err) {}
    });

    // ================= جستجو و فیلترهای اولویت =================
    let searchDebounceTimer;

    dom.activeSearchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        const q = dom.activeSearchInput.value;
        dom.clearActiveSearch.style.display = q ? 'inline-flex' : 'none';

        searchDebounceTimer = setTimeout(() => {
            state.activeSearchQuery = q;
            loadActiveIdeas();
        }, 220);
    });

    dom.clearActiveSearch.addEventListener('click', () => {
        dom.activeSearchInput.value = '';
        dom.clearActiveSearch.style.display = 'none';
        state.activeSearchQuery = '';
        loadActiveIdeas();
    });

    dom.completedSearchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        const q = dom.completedSearchInput.value;
        dom.clearCompletedSearch.style.display = q ? 'inline-flex' : 'none';

        searchDebounceTimer = setTimeout(() => {
            state.completedSearchQuery = q;
            loadCompletedIdeas();
        }, 220);
    });

    dom.clearCompletedSearch.addEventListener('click', () => {
        dom.completedSearchInput.value = '';
        dom.clearCompletedSearch.style.display = 'none';
        state.completedSearchQuery = '';
        loadCompletedIdeas();
    });

    // فیلترهای اولویت
    dom.filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            dom.filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeFilter = pill.dataset.priorityFilter;
            renderActiveIdeas();
        });
    });

    // ================= جابجایی تب‌ها =================
    function switchTab(tabId) {
        state.activeTab = tabId;

        dom.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        dom.tabContents.forEach(content => {
            content.style.display = content.id === tabId ? 'flex' : 'none';
        });

        if (tabId === 'activeTab') {
            loadActiveIdeas();
        } else if (tabId === 'focusTab') {
            loadFocusIdea();
        } else if (tabId === 'completedTab') {
            loadCompletedIdeas();
        }
    }

    dom.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    dom.focusGoToActiveBtn.addEventListener('click', () => switchTab('activeTab'));

    // ================= تغییر تم (Dark / Light) =================
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        state.theme = theme;
        if (theme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            dom.themeSvg.innerHTML = '<use href="#icon-moon"></use>';
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            dom.themeSvg.innerHTML = '<use href="#icon-sun"></use>';
        }
        localStorage.setItem('theme', theme);
    }

    dom.themeToggleBtn.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'theme', value: nextTheme })
        }).catch(() => {});
    });

    // ================= میانبرهای صفحه‌کلید (Keyboard Shortcuts) =================
    document.addEventListener('keydown', (e) => {
        // بستن با Escape
        if (e.key === 'Escape') {
            if (dom.editModal.style.display === 'flex') {
                closeEditModal();
                return;
            }
            if (dom.deleteModal.style.display === 'flex') {
                closeDeleteModal();
                return;
            }
            if (state.activeTab === 'focusTab') {
                switchTab('activeTab');
                return;
            }
            dom.activeSearchInput.blur();
            dom.quickTitleInput.blur();
            return;
        }

        // Ctrl + N: ثبت ایده جدید
        if (e.ctrlKey && (e.key === 'n' || e.key === 'N' || e.key === 'د')) {
            e.preventDefault();
            switchTab('activeTab');
            dom.quickTitleInput.focus();
            return;
        }

        // Ctrl + K: جستجو
        if (e.ctrlKey && (e.key === 'k' || e.key === 'K' || e.key === 'ن')) {
            e.preventDefault();
            if (state.activeTab === 'completedTab') {
                dom.completedSearchInput.focus();
            } else {
                switchTab('activeTab');
                dom.activeSearchInput.focus();
            }
            return;
        }

        // Ctrl + F: کانون تمرکز
        if (e.ctrlKey && (e.key === 'f' || e.key === 'F' || e.key === 'ب')) {
            e.preventDefault();
            if (state.activeTab === 'focusTab') {
                switchTab('activeTab');
            } else {
                switchTab('focusTab');
            }
            return;
        }
    });

    // ایمن‌سازی مقادیر متنی
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ================= بررسی خودکار به‌روزرسانی از گیت‌هاب =================
    async function checkForUpdates() {
        try {
            const res = await apiRequest('/api/check-update');
            if (res && res.success && res.data && res.data.update_available) {
                const data = res.data;
                const banner = document.getElementById('updateBanner');
                const tagEl = document.getElementById('updateVersionTag');
                const linkEl = document.getElementById('updateDownloadLink');
                const dismissBtn = document.getElementById('dismissUpdateBtn');

                if (banner && tagEl && linkEl) {
                    tagEl.textContent = `v${data.latest_version}`;
                    linkEl.href = data.release_url || 'https://github.com/raza6589his-collab/ideas-focus/releases/latest';
                    banner.classList.remove('hidden');

                    if (dismissBtn) {
                        dismissBtn.onclick = () => {
                            banner.classList.add('hidden');
                        };
                    }
                }
            }
        } catch (err) {
            // نادیده گرفتن بی‌صدا در صورت آفلاین بودن
        }
    }

    // آغاز اجرای برنامه
    initTheme();
    loadActiveIdeas();
    setTimeout(checkForUpdates, 1500);
});
