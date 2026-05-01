/**
 * MindVault Desktop — Electron Main Process
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps the React PWA in a native window with:
 * - System tray with context menu
 * - Global keyboard shortcut (Ctrl+Shift+Space → capture)
 * - Minimize to tray instead of quit
 * - Server switching (local Docker ↔ cloud Render)
 * - Native OS notifications
 */
const {
  app, BrowserWindow, Tray, Menu, globalShortcut,
  shell, ipcMain, Notification, nativeTheme,
} = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()
nativeTheme.themeSource = 'dark'

let mainWindow = null
let tray = null

// ── Server configuration ──────────────────────────────────────────────────────
function getApiUrl() {
  const mode = store.get('serverMode', 'cloud')
  if (mode === 'local') return store.get('localUrl', 'http://localhost:8000')
  return store.get('cloudUrl', 'https://mindvault-62ua.onrender.com')
}

function getFrontendUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:5173'
  const mode = store.get('frontendMode', 'remote')
  if (mode === 'local') {
    return `file://${path.join(__dirname, '../web-dist/index.html')}`
  }
  return 'https://mindvault-pearl.vercel.app'
}

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: store.get('windowWidth', 1280),
    height: store.get('windowHeight', 800),
    minWidth: 900,
    minHeight: 600,
    x: store.get('windowX'),
    y: store.get('windowY'),
    backgroundColor: '#1a1a2e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    show: false, // avoid white flash
  })

  mainWindow.loadURL(getFrontendUrl())

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // Inject API URL so frontend knows which backend to call
    const apiUrl = getApiUrl()
    mainWindow.webContents.executeJavaScript(`
      window.MINDVAULT_API_URL = "${apiUrl}";
      localStorage.setItem('electronApiUrl', "${apiUrl}");
      console.log('[Electron] API URL:', "${apiUrl}");
    `)
  })

  // Save window bounds on resize/move
  mainWindow.on('resize', saveWindowBounds)
  mainWindow.on('move', saveWindowBounds)

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Minimize to tray on close
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
      if (process.platform === 'darwin') app.dock?.hide()
    }
  })
}

function saveWindowBounds() {
  if (!mainWindow) return
  const bounds = mainWindow.getBounds()
  store.set('windowWidth', bounds.width)
  store.set('windowHeight', bounds.height)
  store.set('windowX', bounds.x)
  store.set('windowY', bounds.y)
}

// ── Tray ──────────────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'tray-icon.png')
  tray = new Tray(iconPath)

  const buildMenu = () => Menu.buildFromTemplate([
    {
      label: 'Open MindVault',
      click: () => { mainWindow.show(); mainWindow.focus(); if (process.platform === 'darwin') app.dock?.show() },
    },
    { type: 'separator' },
    {
      label: '⚡ Quick Capture',
      accelerator: 'CmdOrCtrl+Shift+Space',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.executeJavaScript('window.openCapture && window.openCapture()')
      },
    },
    {
      label: '⏱ Start Focus Timer',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.executeJavaScript('window.location.href = "/timer"')
      },
    },
    {
      label: '🎵 Music',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.executeJavaScript('window.location.href = "/music"')
      },
    },
    { type: 'separator' },
    {
      label: 'Server',
      submenu: [
        {
          label: '☁ Cloud (Render)',
          type: 'radio',
          checked: store.get('serverMode', 'cloud') === 'cloud',
          click: () => {
            store.set('serverMode', 'cloud')
            mainWindow.webContents.executeJavaScript(
              `localStorage.setItem('electronApiUrl', '${store.get('cloudUrl', 'https://mindvault-62ua.onrender.com')}')`
            )
          },
        },
        {
          label: '● Local PC (Docker)',
          type: 'radio',
          checked: store.get('serverMode', 'cloud') === 'local',
          click: () => {
            store.set('serverMode', 'local')
            mainWindow.webContents.executeJavaScript(
              `localStorage.setItem('electronApiUrl', '${store.get('localUrl', 'http://localhost:8000')}')`
            )
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Quit MindVault',
      click: () => { app.isQuitting = true; app.quit() },
    },
  ])

  tray.setToolTip('MindVault — Your second brain')
  tray.setContextMenu(buildMenu())

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
    if (process.platform === 'darwin') app.dock?.show()
  })

  // Rebuild menu when server mode changes
  store.onDidChange('serverMode', () => tray.setContextMenu(buildMenu()))
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  createTray()

  // Global shortcut: Ctrl/Cmd+Shift+Space → show window + open capture
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show()
      if (process.platform === 'darwin') app.dock?.show()
    }
    mainWindow.focus()
    mainWindow.webContents.executeJavaScript('window.openCapture && window.openCapture()')
  })
})

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.on('show-notification', (_, { title, body }) => {
  new Notification({
    title,
    body,
    icon: path.join(__dirname, '../build/icon.png'),
  }).show()
})

ipcMain.on('open-file', (_, filePath) => shell.openPath(filePath))

ipcMain.handle('get-server-config', () => ({
  mode: store.get('serverMode', 'cloud'),
  localUrl: store.get('localUrl', 'http://localhost:8000'),
  cloudUrl: store.get('cloudUrl', 'https://mindvault-62ua.onrender.com'),
}))

ipcMain.handle('set-server-config', (_, config) => {
  store.set('serverMode', config.mode)
  if (config.localUrl) store.set('localUrl', config.localUrl)
  if (config.cloudUrl) store.set('cloudUrl', config.cloudUrl)
})

// ── Platform-specific ─────────────────────────────────────────────────────────
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (!mainWindow) createWindow()
  else { mainWindow.show(); app.dock?.show() }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('before-quit', () => {
  app.isQuitting = true
})
