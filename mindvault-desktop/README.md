# MindVault Desktop App

Native desktop app for Windows, macOS, and Linux — wraps the MindVault web app with native OS features.

## Features

- **System tray** — runs in background, accessible from tray icon
- **Global shortcut** — `Ctrl+Shift+Space` (anywhere on OS) → open capture
- **Server switching** — switch between local Docker and cloud Render from tray
- **Native notifications** — reminder alerts via OS notification system
- **Minimize to tray** — closing window hides to tray, doesn't quit
- **Window state persistence** — remembers size and position

## Quick Start

```bash
cd mindvault-desktop
npm install

# Development (loads from localhost:5173 or Vercel)
npm run dev

# Production (loads from Vercel)
npm start
```

## Build Installers

```bash
# Windows (.exe installer)
npm run build:win
# Output: dist/MindVault Setup 1.0.0.exe

# macOS (.dmg)
npm run build:mac
# Output: dist/MindVault-1.0.0.dmg

# Linux (.AppImage)
npm run build:linux
# Output: dist/MindVault-1.0.0.AppImage

# All platforms
npm run build:all
```

## Server Configuration

The desktop app can connect to either:

1. **Cloud (Render)** — `https://mindvault-62ua.onrender.com`
   - Works from anywhere
   - May have 30-60s cold start if unused for 15+ min

2. **Local PC (Docker)** — `http://localhost:8000`
   - Instant, no cold starts
   - Requires `make start` in the mindvault folder

Switch via: **Tray icon → Server → Cloud / Local PC**

## Icon Files Required

Place these in the `build/` folder:
- `icon.ico` — Windows (256×256)
- `icon.icns` — macOS (512×512)
- `icon.png` — Linux (512×512)

Generate from the SVG icon:
```bash
cd ../mindvault/frontend
npm run generate:icons
# Then copy the generated icons to mindvault-desktop/build/
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Space` | Open capture modal (global, works anywhere) |
| `Ctrl+K` | Search (when app is focused) |
| `Escape` | Close modal/drawer |

## Architecture

```
Electron Main Process (Node.js)
  ├── BrowserWindow → loads Vercel URL or local dist
  ├── Tray → system tray icon + context menu
  ├── globalShortcut → Ctrl+Shift+Space
  └── IPC → notifications, file open, server config

Renderer Process (Web App)
  ├── Same React app as mindvault-pearl.vercel.app
  ├── window.electron.* → bridge to native features
  └── localStorage.electronApiUrl → overrides API URL
```
