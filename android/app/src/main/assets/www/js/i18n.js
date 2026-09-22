/**
 * Ideas & Focus - Internationalization (i18n) Engine
 * Supported Languages:
 *   - fa: Persian (فارسی) - RTL (Default)
 *   - en: English - LTR
 *   - ar: Arabic (العربية) - RTL
 *   - ja: Japanese (日本語) - LTR
 *   - it: Italian (Italiano) - LTR
 */

const I18N_TRANSLATIONS = {
    fa: {
        dir: 'rtl',
        lang: 'fa',
        fontFamily: "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Tahoma, sans-serif",
        strings: {
            app_title: 'ایده‌ها و تمرکز | Focus & Idea Engine',
            brand_title: 'ایده‌ها و تمرکز',
            brand_tagline: 'محیط شخصی ثبت اندیشه و کار عمیق',
            stat_active: 'فعال',
            stat_focus: 'نیازمند تمرکز',
            stat_completed: 'انجام‌شده',
            theme_toggle_title: 'تغییر تم (تیره / روشن)',
            lang_select_title: 'انتخاب زبان',
            tab_active: 'در حال انجام',
            tab_focus: 'کانون تمرکز',
            tab_completed: 'بایگانی انجام‌شده',
            update_banner_prefix: 'نسخه جدید',
            update_banner_suffix: 'در گیت‌هاب در دسترس است!',
            update_banner_btn: 'مشاهده و دریافت نسخه جدید از گیت‌هاب',
            dismiss_update: 'بستن این اعلان',
            capture_heading: 'چه چیزی الان توی ذهنت هست؟',
            capture_sub: 'ثبتش کن؛ بعداً بهش رسیدگی می‌کنیم.',
            capture_placeholder: 'ایده‌ات را کوتاه بنویس...',
            priority_label: 'اولویت:',
            priority_high: 'زیاد',
            priority_medium: 'متوسط',
            priority_low: 'کم',
            toggle_desc: 'توضیحات',
            submit_idea: 'ثبت ایده',
            desc_placeholder: 'یادداشت‌ها، پیوندها یا فرضیات اولیه (اختیاری)...',
            search_placeholder: 'جستجو در ایده‌ها... (Ctrl+K)',
            clear_search: 'پاک کردن جستجو',
            filter_all: 'همه',
            section_ideas: 'فهرست ایده‌ها',
            empty_active_headline: 'فعلاً چیزی اینجا نیست.',
            empty_active_text: 'هر ایده‌ای که به ذهنت رسید، همین‌جا بنویس تا ذهنت آزاد بشه.',
            focus_kicker: 'کانون تمرکز',
            focus_motto: 'الان فقط همین یک مورد اهمیت دارد.',
            empty_focus_headline: 'چیزی برای تمرکز وجود ندارد.',
            empty_focus_text: 'یا همه ایده‌ها به پایان رسیده‌اند، یا هنوز ایده‌ای در اولویت بالا ثبت نشده است.',
            focus_back_btn: 'بازگشت به فهرست ایده‌ها',
            focus_complete_btn: 'این ایده انجام شد',
            focus_pin_on: 'سنجاق به عنوان تمرکز اصلی',
            focus_pin_off: 'سنجاق تمرکز برداشته شود',
            focus_created_date: 'ثبت شده در:',
            archive_title: 'بایگانی ایده‌های انجام‌شده',
            archive_desc: 'ایده‌های به پایان رسیده در این بخش نگهداری می‌شوند.',
            archive_desc_with_count: '{count} ایده با موفقیت به سرانجام رسیده و بایگانی شده است.',
            archive_search_placeholder: 'جستجو در بایگانی...',
            empty_archive_headline: 'هنوز چیزی را تمام نکرده‌ای.',
            empty_archive_text: 'وقتی کاری را تمام کردی، در آرامش اینجا بایگانی می‌شود.',
            shortcut_capture: 'ثبت ایده',
            shortcut_search: 'جستجو',
            shortcut_focus: 'کانون تمرکز',
            shortcut_close: 'بستن پنجره',
            footer_brand: 'ثبت سریع • اولویت‌بندی آگاهانه • تمرکز بر یک ایده',
            edit_modal_title: 'ویرایش ایده',
            close_modal: 'بستن پنجره',
            edit_title_label: 'عنوان ایده',
            edit_desc_label: 'یادداشت‌ها و جزئیات',
            edit_desc_placeholder: 'توضیحات اختیاری...',
            edit_priority_label: 'سطح اولویت',
            btn_cancel: 'انصراف',
            btn_save: 'ذخیره تغییرات',
            delete_modal_title: 'حذف دائمی',
            delete_confirm_q: 'آیا از حذف همیشگی این ایده اطمینان داری؟',
            delete_warning: 'این ایده برای همیشه از دیتابیس پاک خواهد شد و قابل بازگشت نیست.',
            btn_delete_confirm: 'حذف برای همیشه',
            toast_completed: 'ایده به پایان رسید و بایگانی شد.',
            toast_undo: 'برگرداندن (Undo)',
            toast_pinned: 'ایده به کانون تمرکز پین شد.',
            toast_unpinned: 'سنجاق تمرکز برداشته شد.',
            toast_saved: 'تغییرات ایده ذخیره شد.',
            toast_created: 'ایده جدید با موفقیت ثبت شد.',
            toast_deleted: 'ایده برای همیشه حذف شد.',
            toast_restored: 'ایده بازگردانده شد.',
            toast_error: 'خطا در برقراری ارتباط با سیستم.',
            item_action_focus: 'تمرکز',
            item_action_edit: 'ویرایش',
            item_action_restore: 'برگرداندن',
            item_action_delete: 'حذف',
            item_pin_tag: 'سنجاق تمرکز',
            item_pin_title: 'سنجاق‌شده به عنوان کانون تمرکز اصلی',
            item_priority_prefix: 'اولویت',
            item_check_title: 'علامت‌گذاری به عنوان انجام‌شده',
            item_cycle_priority_title: 'کلیک برای تغییر اولویت',
            completed_on: 'انجام شد:',
            time_now: 'همین حالا',
            time_min_ago: '{min} دقیقه پیش',
            time_hour_ago: '{hour} ساعت پیش',
            time_yesterday: 'دیروز'
        }
    },

    en: {
        dir: 'ltr',
        lang: 'en',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        strings: {
            app_title: 'Ideas & Focus | Focus & Idea Engine',
            brand_title: 'Ideas & Focus',
            brand_tagline: 'Personal space for capturing thoughts & deep work',
            stat_active: 'Active',
            stat_focus: 'Needs Focus',
            stat_completed: 'Completed',
            theme_toggle_title: 'Toggle Theme (Dark / Light)',
            lang_select_title: 'Select Language',
            tab_active: 'In Progress',
            tab_focus: 'Focus Sanctuary',
            tab_completed: 'Completed Archive',
            update_banner_prefix: 'New version',
            update_banner_suffix: 'is available on GitHub!',
            update_banner_btn: 'View and download update on GitHub',
            dismiss_update: 'Dismiss notification',
            capture_heading: "What's on your mind right now?",
            capture_sub: 'Capture it now; handle it later.',
            capture_placeholder: 'Write your idea briefly...',
            priority_label: 'Priority:',
            priority_high: 'High',
            priority_medium: 'Medium',
            priority_low: 'Low',
            toggle_desc: 'Notes',
            submit_idea: 'Capture Idea',
            desc_placeholder: 'Notes, links, or initial thoughts (optional)...',
            search_placeholder: 'Search ideas... (Ctrl+K)',
            clear_search: 'Clear search',
            filter_all: 'All',
            section_ideas: 'Ideas List',
            empty_active_headline: 'Nothing here right now.',
            empty_active_text: 'Whenever an idea strikes, capture it here to free your mind.',
            focus_kicker: 'Focus Sanctuary',
            focus_motto: 'Only this single task matters right now.',
            empty_focus_headline: 'Nothing to focus on right now.',
            empty_focus_text: 'Either all ideas are completed, or no high-priority ideas have been captured yet.',
            focus_back_btn: 'Back to Ideas List',
            focus_complete_btn: 'Mark as Completed',
            focus_pin_on: 'Pin as Main Focus',
            focus_pin_off: 'Unpin from Focus',
            focus_created_date: 'Created on:',
            archive_title: 'Completed Ideas Archive',
            archive_desc: 'Finished ideas are stored peacefully here.',
            archive_desc_with_count: '{count} ideas successfully completed and archived.',
            archive_search_placeholder: 'Search archive...',
            empty_archive_headline: "You haven't finished anything yet.",
            empty_archive_text: 'When you complete a task, it will be saved peacefully here.',
            shortcut_capture: 'Capture idea',
            shortcut_search: 'Search',
            shortcut_focus: 'Focus sanctuary',
            shortcut_close: 'Close window',
            footer_brand: 'Quick Capture • Mindful Priority • Single-task Focus',
            edit_modal_title: 'Edit Idea',
            close_modal: 'Close window',
            edit_title_label: 'Idea Title',
            edit_desc_label: 'Notes & Details',
            edit_desc_placeholder: 'Optional notes...',
            edit_priority_label: 'Priority Level',
            btn_cancel: 'Cancel',
            btn_save: 'Save Changes',
            delete_modal_title: 'Permanent Delete',
            delete_confirm_q: 'Are you sure you want to permanently delete this idea?',
            delete_warning: 'This idea will be permanently removed from the database and cannot be recovered.',
            btn_delete_confirm: 'Delete Permanently',
            toast_completed: 'Idea completed and archived.',
            toast_undo: 'Undo',
            toast_pinned: 'Idea pinned as main focus.',
            toast_unpinned: 'Unpinned from main focus.',
            toast_saved: 'Idea changes saved successfully.',
            toast_created: 'New idea captured successfully.',
            toast_deleted: 'Idea permanently deleted.',
            toast_restored: 'Idea restored to active list.',
            toast_error: 'Connection error occurred.',
            item_action_focus: 'Focus',
            item_action_edit: 'Edit',
            item_action_restore: 'Restore',
            item_action_delete: 'Delete',
            item_pin_tag: 'Pinned Focus',
            item_pin_title: 'Pinned as main focus priority',
            item_priority_prefix: 'Priority:',
            item_check_title: 'Mark as completed',
            item_cycle_priority_title: 'Click to cycle priority',
            completed_on: 'Completed:',
            time_now: 'Just now',
            time_min_ago: '{min}m ago',
            time_hour_ago: '{hour}h ago',
            time_yesterday: 'Yesterday'
        }
    },

    ar: {
        dir: 'rtl',
        lang: 'ar',
        fontFamily: "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif",
        strings: {
            app_title: 'الأفكار والتركيز | Focus & Idea Engine',
            brand_title: 'الأفكار والتركيز',
            brand_tagline: 'مساحتك الخاصة لتدوين الأفكار والعمل العميق',
            stat_active: 'نشط',
            stat_focus: 'يحتاج تركيز',
            stat_completed: 'مكتمل',
            theme_toggle_title: 'تبديل المظهر (داكن / فاتح)',
            lang_select_title: 'اختر اللغة',
            tab_active: 'قيد التنفيذ',
            tab_focus: 'بؤرة التركيز',
            tab_completed: 'أرشيف المنجزات',
            update_banner_prefix: 'إصدار جديد',
            update_banner_suffix: 'متوفر على GitHub!',
            update_banner_btn: 'عرض وتنزيل التحديث من GitHub',
            dismiss_update: 'إغلاق هذا الإشعار',
            capture_heading: 'ما الذي يدور في ذهنك الآن؟',
            capture_sub: 'دوّنه الآن؛ وسنتعامل معه لاحقاً.',
            capture_placeholder: 'اكتب فكرتك باختصار...',
            priority_label: 'الأولوية:',
            priority_high: 'عالية',
            priority_medium: 'متوسطة',
            priority_low: 'منخفضة',
            toggle_desc: 'ملاحظات',
            submit_idea: 'إضافة الفكرة',
            desc_placeholder: 'ملاحظات، روابط، أو أفكار أولية (اختياري)...',
            search_placeholder: 'البحث في الأفكار... (Ctrl+K)',
            clear_search: 'مسح البحث',
            filter_all: 'الكل',
            section_ideas: 'قائمة الأفكار',
            empty_active_headline: 'لا يوجد شيء هنا حالياً.',
            empty_active_text: 'أي فكرة تخطر في بالك، دوّنها هنا لتصفي ذهنك.',
            focus_kicker: 'بؤرة التركيز',
            focus_motto: 'هذا الأمر الوحيد الذي يهم الآن.',
            empty_focus_headline: 'لا يوجد شيء للتركيز عليه حالياً.',
            empty_focus_text: 'إما أن جميع الأفكار قد اكتملت، أو لم يتم تسجيل فكرة ذات أولوية عالية بعد.',
            focus_back_btn: 'العودة إلى قائمة الأفكار',
            focus_complete_btn: 'تم إنجاز هذه الفكرة',
            focus_pin_on: 'تثبيت كبؤرة تركيز رئيسية',
            focus_pin_off: 'إلغاء التثبيت من التركيز',
            focus_created_date: 'تم الإنشاء في:',
            archive_title: 'أرشيف الأفكار المكتملة',
            archive_desc: 'الأفكار المكتملة تُحفظ هنا في هدوء.',
            archive_desc_with_count: 'تم إنجاز {count} فكرة وأرشفتها بنجاح.',
            archive_search_placeholder: 'البحث في الأرشيف...',
            empty_archive_headline: 'لم تكمل أي فكرة بعد.',
            empty_archive_text: 'عند إنهاء أي عمل، سيتم حفظه هنا بهدوء.',
            shortcut_capture: 'إضافة فكرة',
            shortcut_search: 'بحث',
            shortcut_focus: 'بؤرة التركيز',
            shortcut_close: 'إغلاق النافذة',
            footer_brand: 'تدوين سريع • أولوية مدروسة • تركيز على فكرة واحدة',
            edit_modal_title: 'تعديل الفكرة',
            close_modal: 'إغلاق النافذة',
            edit_title_label: 'عنوان الفكرة',
            edit_desc_label: 'الملاحظات والتفاصيل',
            edit_desc_placeholder: 'ملاحظات اختيارية...',
            edit_priority_label: 'مستوى الأولوية',
            btn_cancel: 'إلغاء',
            btn_save: 'حفظ التعديلات',
            delete_modal_title: 'حذف نهائي',
            delete_confirm_q: 'هل أنت متأكد من رغبتك في حذف هذه الفكرة نهائياً؟',
            delete_warning: 'سيتم مسح هذه الفكرة نهائياً من قاعدة البيانات ولا يمكن استرجاعها.',
            btn_delete_confirm: 'حذف نهائي',
            toast_completed: 'تم إنجاز الفكرة ونقلها للأرشيف.',
            toast_undo: 'تراجع (Undo)',
            toast_pinned: 'تم تثبيت الفكرة كبؤرة تركيز رئيسية.',
            toast_unpinned: 'تم إلغاء التثبيت من التركيز.',
            toast_saved: 'تم حفظ تعديلات الفكرة بنجاح.',
            toast_created: 'تمت إضافة الفكرة بنجاح.',
            toast_deleted: 'تم حذف الفكرة نهائياً.',
            toast_restored: 'تمت استعادة الفكرة إلى القائمة النشطة.',
            toast_error: 'حدث خطأ في الاتصال بالنظام.',
            item_action_focus: 'تركيز',
            item_action_edit: 'تعديل',
            item_action_restore: 'استعادة',
            item_action_delete: 'حذف',
            item_pin_tag: 'مثبت للتركيز',
            item_pin_title: 'مثبت كبؤرة تركيز رئيسية',
            item_priority_prefix: 'أولوية:',
            item_check_title: 'وضع علامة كمكتمل',
            item_cycle_priority_title: 'انقر لتبديل الأولوية',
            completed_on: 'أُنجزت في:',
            time_now: 'الآن',
            time_min_ago: 'منذ {min} دقيقة',
            time_hour_ago: 'منذ {hour} ساعة',
            time_yesterday: 'أمس'
        }
    },

    ja: {
        dir: 'ltr',
        lang: 'ja',
        fontFamily: "'Hiragino Sans', 'Meiryo', 'Yu Gothic', -apple-system, BlinkMacSystemFont, sans-serif",
        strings: {
            app_title: 'アイディアと集中 | Focus & Idea Engine',
            brand_title: 'アイディアと集中',
            brand_tagline: '思考の記録と深い集中のためのパーソナルスペース',
            stat_active: 'アクティブ',
            stat_focus: '要集中',
            stat_completed: '完了',
            theme_toggle_title: 'テーマ切替 (ダーク/ライト)',
            lang_select_title: '言語を選択',
            tab_active: '進行中',
            tab_focus: '集中スペース',
            tab_completed: '完了アーカイブ',
            update_banner_prefix: '新バージョン',
            update_banner_suffix: 'がGitHubで利用可能です！',
            update_banner_btn: 'GitHubで更新を確認・ダウンロード',
            dismiss_update: '通知を閉じる',
            capture_heading: '今、何を考えていますか？',
            capture_sub: '今すぐ記録して、後で取り組みましょう。',
            capture_placeholder: 'アイディアを簡潔に入力...',
            priority_label: '優先度:',
            priority_high: '高',
            priority_medium: '中',
            priority_low: '低',
            toggle_desc: '詳細・メモ',
            submit_idea: 'アイディア追加',
            desc_placeholder: 'メモ、リンク、補足情報（任意）...',
            search_placeholder: 'アイディアを検索... (Ctrl+K)',
            clear_search: '検索をクリア',
            filter_all: 'すべて',
            section_ideas: 'アイディア一覧',
            empty_active_headline: '現在、アイディアはありません。',
            empty_active_text: '思いついたアイディアを記録して、頭の中をスッキリさせましょう。',
            focus_kicker: '集中スペース',
            focus_motto: '今はこの1つのタスクだけに専念しましょう。',
            empty_focus_headline: '現在集中するタスクはありません。',
            empty_focus_text: 'すべてのタスクが完了しているか、まだ優先度の高いアイディアが登録されていません。',
            focus_back_btn: 'アイディア一覧に戻る',
            focus_complete_btn: 'このタスクを完了',
            focus_pin_on: 'メインの集中タスクとして固定',
            focus_pin_off: '固定を解除',
            focus_created_date: '作成日時:',
            archive_title: '完了したアイディアのアーカイブ',
            archive_desc: '完了したアイディアはここに整理・保管されます。',
            archive_desc_with_count: '{count} 件のアイディアが完了し、アーカイブされました。',
            archive_search_placeholder: 'アーカイブを検索...',
            empty_archive_headline: 'まだ完了したタスクはありません。',
            empty_archive_text: 'タスクを完了すると、ここに保存されます。',
            shortcut_capture: 'アイディア登録',
            shortcut_search: '検索',
            shortcut_focus: '集中モード',
            shortcut_close: '閉じる',
            footer_brand: '素早い記録 • 適切な優先順位 • 1つのタスクに集中',
            edit_modal_title: 'アイディアの編集',
            close_modal: 'ウィンドウを閉じる',
            edit_title_label: 'タイトル',
            edit_desc_label: 'メモ・詳細',
            edit_desc_placeholder: '任意のメモ...',
            edit_priority_label: '優先度',
            btn_cancel: 'キャンセル',
            btn_save: '変更を保存',
            delete_modal_title: '完全に削除',
            delete_confirm_q: 'このアイディアを完全に削除してもよろしいですか？',
            delete_warning: 'このアイディアはデータベースから完全に削除され、復元できなくなります。',
            btn_delete_confirm: '完全に削除',
            toast_completed: 'アイディアが完了しアーカイブされました。',
            toast_undo: '元に戻す (Undo)',
            toast_pinned: '集中タスクとしてピン留めしました。',
            toast_unpinned: 'ピン留めを解除しました。',
            toast_saved: '変更が正常に保存されました。',
            toast_created: '新しいアイディアを登録しました。',
            toast_deleted: 'アイディアを完全に削除しました。',
            toast_restored: 'アイディアを進行中リストに戻しました。',
            toast_error: '通信エラーが発生しました。',
            item_action_focus: '集中',
            item_action_edit: '編集',
            item_action_restore: '復元',
            item_action_delete: '削除',
            item_pin_tag: '固定タスク',
            item_pin_title: '最優先タスクとして固定中',
            item_priority_prefix: '優先度:',
            item_check_title: '完了としてマーク',
            item_cycle_priority_title: 'クリックして優先度を切り替え',
            completed_on: '完了日時:',
            time_now: 'たった今',
            time_min_ago: '{min}分前',
            time_hour_ago: '{hour}時間前',
            time_yesterday: '昨日'
        }
    },

    it: {
        dir: 'ltr',
        lang: 'it',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        strings: {
            app_title: 'Idee e Focus | Focus & Idea Engine',
            brand_title: 'Idee e Focus',
            brand_tagline: 'Spazio personale per catturare pensieri e lavoro profondo',
            stat_active: 'Attivi',
            stat_focus: 'Richiede Focus',
            stat_completed: 'Completati',
            theme_toggle_title: 'Cambia tema (Scuro / Chiaro)',
            lang_select_title: 'Seleziona lingua',
            tab_active: 'In Corso',
            tab_focus: 'Santuario del Focus',
            tab_completed: 'Archivio Completati',
            update_banner_prefix: 'Una nuova versione',
            update_banner_suffix: 'è disponibile su GitHub!',
            update_banner_btn: 'Visualizza e scarica la nuova versione su GitHub',
            dismiss_update: 'Chiudi notifica',
            capture_heading: 'Cosa hai in mente in questo momento?',
            capture_sub: 'Annotalo ora; ci penserai più tardi.',
            capture_placeholder: 'Scrivi brevemente la tua idea...',
            priority_label: 'Priorità:',
            priority_high: 'Alta',
            priority_medium: 'Media',
            priority_low: 'Bassa',
            toggle_desc: 'Note',
            submit_idea: 'Aggiungi Idea',
            desc_placeholder: 'Note, link o prime considerazioni (opzionale)...',
            search_placeholder: 'Cerca idee... (Ctrl+K)',
            clear_search: 'Cancella ricerca',
            filter_all: 'Tutte',
            section_ideas: 'Lista Idee',
            empty_active_headline: "Non c'è niente qui al momento.",
            empty_active_text: 'Qualunque idea ti venga in mente, scrivila qui per liberare la mente.',
            focus_kicker: 'Santuario del Focus',
            focus_motto: 'Solo questa singola cosa conta adesso.',
            empty_focus_headline: "Niente su cui concentrarsi al momento.",
            empty_focus_text: 'Tutte le idee sono state completate o non ci sono ancora idee ad alta priorità.',
            focus_back_btn: 'Torna alla lista idee',
            focus_complete_btn: 'Segna come completata',
            focus_pin_on: 'Fissa come focus principale',
            focus_pin_off: 'Rimuovi dal focus',
            focus_created_date: 'Creata il:',
            archive_title: 'Archivio Idee Completate',
            archive_desc: 'Le idee completate sono archiviate con ordine qui.',
            archive_desc_with_count: '{count} idee completate con successo e archiviate.',
            archive_search_placeholder: "Cerca nell'archivio...",
            empty_archive_headline: 'Non hai ancora completato nulla.',
            empty_archive_text: "Quando completerai un'idea, verrà archiviata qui con ordine.",
            shortcut_capture: 'Nuova idea',
            shortcut_search: 'Cerca',
            shortcut_focus: 'Focus',
            shortcut_close: 'Chiudi finestra',
            footer_brand: 'Cattura rapida • Priorità consapevole • Concentrazione su una singola idea',
            edit_modal_title: 'Modifica Idea',
            close_modal: 'Chiudi finestra',
            edit_title_label: 'Titolo idea',
            edit_desc_label: 'Note e dettagli',
            edit_desc_placeholder: 'Note opzionali...',
            edit_priority_label: 'Livello di priorità',
            btn_cancel: 'Annulla',
            btn_save: 'Salva modifiche',
            delete_modal_title: 'Eliminazione definitiva',
            delete_confirm_q: 'Sei sicuro di voler eliminare definitivamente questa idea?',
            delete_warning: 'Questa idea verrà cancellata per sempre dal database e non potrà essere recuperata.',
            btn_delete_confirm: 'Elimina definitivamente',
            toast_completed: 'Idea completata e archiviata.',
            toast_undo: 'Annulla (Undo)',
            toast_pinned: 'Idea fissata come focus principale.',
            toast_unpinned: 'Rimosso dal focus principale.',
            toast_saved: 'Modifiche salvate con successo.',
            toast_created: 'Nuova idea aggiunta con successo.',
            toast_deleted: 'Idea eliminata definitivamente.',
            toast_restored: 'Idea ripristinata nella lista in corso.',
            toast_error: 'Si è verificato un errore di connessione.',
            item_action_focus: 'Focus',
            item_action_edit: 'Modifica',
            item_action_restore: 'Ripristina',
            item_action_delete: 'Elimina',
            item_pin_tag: 'Focus Fissato',
            item_pin_title: 'Fissata come focus prioritario',
            item_priority_prefix: 'Priorità:',
            item_check_title: 'Segna come completata',
            item_cycle_priority_title: 'Clicca per cambiare priorità',
            completed_on: 'Completata:',
            time_now: 'Proprio ora',
            time_min_ago: '{min}m fa',
            time_hour_ago: '{hour}h fa',
            time_yesterday: 'Ieri'
        }
    }
};

class I18nManager {
    constructor() {
        this.currentLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('ideas_app_language') : null) || 'fa';
        if (!I18N_TRANSLATIONS[this.currentLang]) {
            this.currentLang = 'fa';
        }
    }

    t(key, params = {}) {
        const langData = I18N_TRANSLATIONS[this.currentLang] || I18N_TRANSLATIONS['fa'];
        let text = langData.strings[key];
        if (text === undefined) {
            // Fallback to Persian or key itself
            text = I18N_TRANSLATIONS['fa'].strings[key] || key;
        }

        if (params && typeof params === 'object') {
            for (const [k, v] of Object.entries(params)) {
                text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
            }
        }
        return text;
    }

    getLocale() {
        switch (this.currentLang) {
            case 'fa': return 'fa-IR';
            case 'ar': return 'ar-EG';
            case 'ja': return 'ja-JP';
            case 'it': return 'it-IT';
            case 'en':
            default:
                return 'en-US';
        }
    }

    formatNumber(num) {
        try {
            return Number(num).toLocaleString(this.getLocale());
        } catch {
            return String(num);
        }
    }

    formatDateTime(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat(this.getLocale(), {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(date);
        } catch {
            return isoString;
        }
    }

    formatRelativeTime(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffSec = Math.floor((now - date) / 1000);

            if (diffSec < 60) return this.t('time_now');
            if (diffSec < 3600) {
                const min = Math.floor(diffSec / 60);
                return this.t('time_min_ago', { min: this.formatNumber(min) });
            }
            if (diffSec < 86400) {
                const hour = Math.floor(diffSec / 3600);
                return this.t('time_hour_ago', { hour: this.formatNumber(hour) });
            }
            if (diffSec < 172800) return this.t('time_yesterday');
            return this.formatDateTime(isoString);
        } catch {
            return this.formatDateTime(isoString);
        }
    }

    setLanguage(newLang) {
        if (!I18N_TRANSLATIONS[newLang]) return;
        this.currentLang = newLang;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ideas_app_language', newLang);
        }

        const config = I18N_TRANSLATIONS[newLang];
        if (typeof document !== 'undefined') {
            document.documentElement.lang = config.lang;
            document.documentElement.dir = config.dir;
            if (document.body) {
                document.body.dir = config.dir;
                document.body.style.fontFamily = config.fontFamily;
            }
            // Apply all static data-i18n attributes
            this.applyDomTranslations();
        }

        // Dispatch language change event for dynamic components (active list, focus, archive)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
        }
    }

    applyDomTranslations() {
        if (typeof document === 'undefined') return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = this.t(key);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                el.placeholder = this.t(key);
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) {
                el.title = this.t(key);
                el.setAttribute('aria-label', this.t(key));
            }
        });

        document.title = this.t('app_title');
    }

    init() {
        this.setLanguage(this.currentLang);
    }
}

// Global instance & export
const i18nInstance = new I18nManager();
if (typeof window !== 'undefined') {
    window.i18n = i18nInstance;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { i18n: i18nInstance, I18nManager, I18N_TRANSLATIONS };
}
