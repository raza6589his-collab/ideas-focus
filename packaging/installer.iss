; ==============================================================================
; اسکریپت ساخت فایل نصبی ویندوز با Inno Setup 7 برای نرم‌افزار "ایده‌ها و تمرکز"
; Ideas & Focus - Windows Desktop Edition Installer
; ==============================================================================

#define MyAppName "ایده‌ها و تمرکز"
#define MyAppEnglishName "Ideas & Focus"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Ideas Management Team"
#define MyAppURL "https://github.com/raza6589his-collab/ideas-focus"
#define MyAppExeName "IdeasFocus.exe"
#define MyAppId "{{C78F04C1-3DA2-4E4E-9DE5-75A0E134C4F0}}"

[Setup]
; شناسه یکتای نرم‌افزار جهت ارتقا و حذف یکپارچه
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; مسیر پیش‌فرض نصب: پشتیبانی هوشمند از حالت کاربر عادی (Local AppData) و ادمین (Program Files)
DefaultDirName={autopf}\IdeasFocus
DefaultGroupName={#MyAppName}

; تنظیمات سطح دسترسی (امکان نصب برای کاربر جاری بدون نیاز اجباری به ادمین)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog commandline

; مسیر خروجی فایل نصبی و نام آن
OutputDir=..\installer
OutputBaseFilename=IdeasFocus_Setup_v{#MyAppVersion}

; آیکون فایل نصبی و اطلاعات بصری
SetupIconFile=..\desktop\app_icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

; فشرده‌سازی با کارایی بالا (الگوریتم مدرن LZMA2)
Compression=lzma2/ultra64
SolidCompression=yes

; معماری مقصد ویندوز 64 بیتی
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible

; بسته شدن خودکار پروسس در صورت باز بودن برنامه هنگام نصب یا حذف
CloseApplications=yes
CloseApplicationsFilter={#MyAppExeName}

; ظاهر مدرن ویزارد
WizardStyle=modern
DisableDirPage=no
DisableProgramGroupPage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[CustomMessages]
english.AppTitle=ایده‌ها و تمرکز (Ideas & Focus)
english.CreateDesktopIcon=ایجاد میانبر روی دسکتاپ (Create Desktop Shortcut)
english.CreateStartupIcon=اجرای خودکار هنگام روشن شدن ویندوز (Start with Windows)
english.AdditionalOptions=گزینه‌های اضافی (Additional Options):
english.LaunchApp=اجرای برنامه ایده‌ها و تمرکز (Launch Ideas & Focus)

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalOptions}"; Flags: unchecked
Name: "startupicon"; Description: "{cm:CreateStartupIcon}"; GroupDescription: "{cm:AdditionalOptions}"; Flags: unchecked

[Files]
; کپی تمام فایل‌های باینری کامپایل‌شده برنامه
Source: "..\dist\IdeasFocus\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; میانبر منوی استارت
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\حذف برنامه ({#MyAppEnglishName} Uninstall)"; Filename: "{uninstallexe}"

; میانبر اختیاری دسکتاپ
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon; IconFilename: "{app}\{#MyAppExeName}"

; میانبر اختیاری استارت‌آپ ویندوز
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon; IconFilename: "{app}\{#MyAppExeName}"

[Run]
; گزینه اجرای برنامه پس از اتمام موفقیت‌آمیز نصب
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchApp}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; پاکسازی فایل‌های لاگ و کش پس از حذف (پایگاه‌داده اصلی در APPDATA کاربر برای امنیت داده دست‌نخورده می‌ماند)
Type: files; Name: "{app}\*.log"
Type: dirifempty; Name: "{app}"
