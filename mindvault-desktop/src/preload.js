/**
 * Preload Script — Secure Context Bridge
 * ─────────────────────────────────────────────────────────────────────────────
 * Exposes safe Electron APIs to the renderer (web app).
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Show native OS notification
  showNotification: (title, body) =>
    ipcRenderer.send('show-notification', { title, body }),

  // Open file in system default app
  openFile: (filePath) =>
    ipcRenderer.send('open-file', filePath),

  // Get server configuration
  getServerConfig: () =>
    ipcRenderer.invoke('get-server-config'),

  // Update server configuration
  setServerConfig: (config) =>
    ipcRenderer.invoke('set-server-config', config),

  // Platform info
  isElectron: true,
  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0',
})
