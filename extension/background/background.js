/**
 * MindVault Extension — Background Service Worker
 * Handles context menus, keyboard shortcuts, and API calls
 */

// ── Context Menu Setup ────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-mindvault',
    title: 'Save to MindVault',
    contexts: ['page', 'link', 'selection', 'image'],
  })
  chrome.contextMenus.create({
    id: 'save-link-to-mindvault',
    title: 'Save link to MindVault',
    contexts: ['link'],
  })
  chrome.contextMenus.create({
    id: 'save-selection-to-mindvault',
    title: 'Save selection as note',
    contexts: ['selection'],
  })
})

// ── Context Menu Click ────────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await getSettings()

  if (!settings.serverUrl || !settings.accessToken) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon48.png',
      title: 'MindVault',
      message: 'Please configure your server URL and login first.',
    })
    chrome.runtime.openOptionsPage()
    return
  }

  if (info.menuItemId === 'save-link-to-mindvault' && info.linkUrl) {
    await saveCard(settings, { type: 'link', url: info.linkUrl, title: info.linkUrl })
  } else if (info.menuItemId === 'save-selection-to-mindvault' && info.selectionText) {
    await saveCard(settings, {
      type: 'note',
      title: `Note from ${tab?.title || 'web'}`,
      body: info.selectionText,
    })
  } else if (info.menuItemId === 'save-to-mindvault') {
    await saveCard(settings, {
      type: 'link',
      url: tab?.url || '',
      title: tab?.title || '',
    })
  }
})

// ── Keyboard Shortcut ─────────────────────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab) return

    const settings = await getSettings()
    if (!settings.serverUrl || !settings.accessToken) {
      chrome.runtime.openOptionsPage()
      return
    }

    await saveCard(settings, {
      type: 'link',
      url: tab.url || '',
      title: tab.title || '',
    })
  }
})

// ── Message Handler (from popup/content) ─────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_CARD') {
    getSettings().then(settings => {
      saveCard(settings, message.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(err => sendResponse({ success: false, error: err.message }))
    })
    return true // keep channel open for async response
  }

  if (message.type === 'GET_PAGE_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      sendResponse({ url: tab?.url, title: tab?.title, favIconUrl: tab?.favIconUrl })
    })
    return true
  }

  if (message.type === 'CHECK_AUTH') {
    getSettings().then(settings => {
      sendResponse({ authenticated: !!(settings.serverUrl && settings.accessToken) })
    })
    return true
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['serverUrl', 'accessToken', 'refreshToken'], resolve)
  })
}

async function saveCard(settings, cardData) {
  const { serverUrl, accessToken } = settings

  const response = await fetch(`${serverUrl}/api/cards/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(cardData),
  })

  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshToken(settings)
    if (refreshed) {
      const newSettings = await getSettings()
      return saveCard(newSettings, cardData)
    }
    throw new Error('Authentication failed. Please login again.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Server error: ${response.status}`)
  }

  const result = await response.json()

  // Show success notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon48.png',
    title: 'Saved to MindVault ✓',
    message: result.title || 'Card saved successfully',
  })

  return result
}

async function refreshToken(settings) {
  if (!settings.refreshToken) return false

  try {
    const response = await fetch(`${settings.serverUrl}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: settings.refreshToken }),
    })

    if (!response.ok) return false

    const { access, refresh } = await response.json()
    await chrome.storage.sync.set({ accessToken: access, refreshToken: refresh || settings.refreshToken })
    return true
  } catch {
    return false
  }
}
