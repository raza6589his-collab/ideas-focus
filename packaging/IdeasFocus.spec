# -*- mode: python ; coding: utf-8 -*-
import os
import sys

block_cipher = None

project_dir = os.path.abspath(os.path.join(SPECPATH, '..'))

datas = [
    (os.path.join(project_dir, 'templates'), 'templates'),
    (os.path.join(project_dir, 'static'), 'static'),
    (os.path.join(project_dir, 'desktop'), 'desktop'),
]

hiddenimports = [
    'PySide6.QtWebEngineWidgets',
    'PySide6.QtWebEngineCore',
    'PySide6.QtCore',
    'PySide6.QtGui',
    'PySide6.QtWidgets',
    'flask',
    'jinja2',
    'werkzeug',
    'sqlite3',
    'database',
    'app',
]

a = Analysis(
    [os.path.join(project_dir, 'desktop_app.py')],
    pathex=[project_dir],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'numpy', 'scipy', 'torch', 'transformers'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='IdeasFocus',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=os.path.join(project_dir, 'desktop', 'app_icon.ico'),
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='IdeasFocus',
)
