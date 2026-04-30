/**
 * MindVault Extension — Popup Script
 */

let currentTab = null
let currentType = 'link'
let settings = {}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  settings = await getSettings()

  if (!settings.serverUrl || !settings.accessToken) {
    showScreen('auth')
    return
  }

  showScreen('main')
  await loadPageInfo()
  await loadUserInfo()
})

// ── Screen management ─────────────────────────────────────────────────────────
function showScreen(name) {
  document.getElementById('auth-screen').style.display = name === 'auth' ? 'block' : 'none'
  document.getElementById('main-screen').style.display = name === 'main' ? 'block' : 'none'
}

// ── Load page info ────────────────────────────────────────────────────────────
async function loadPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    currentTab = tab

    // Try to get richer metadata from content script
    let metadata = null
    try {
      metadata = await chrome.tabs.sendMessage(tab.id, { type: 'GET_METADATA' })
    } catch {
      // Content script not available (e.g., chrome:// pages)
    }

    const title = metadata?.title || tab.title || ''
    const url = tab.url || ''
    const favicon = metadata?.favicon || tab.favIconUrl || ''

    document.getElementById('page-title').textContent = title
    document.getElementById('page-url').textContent = new URL(url).hostname
    document.getElementById('card-title').value = title
    if (favicon) document.getElementById('page-favicon').src = favicon

    // Auto-detect type
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setType('youtube')
    } else if (url.includes('github.com')) {
      setType('github')
    }

    // Pre-fill note with selected text if any
    if (metadata?.selectedText) {
      document.getElementById('note-body').value = metadata.selectedText
    }
  } catch (err) {
    console.error('Failed to load page info:', err)
  }
}

// ── Load user info ────────────────────────────────────────────────────────────
async function loadUserInfo() {
  try {
    const response = await fetch(`${settings.serverUrl}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${settings.accessToken}` },
    })
    if (response.ok) {
      const user = await response.json()
      document.getElementById('user-name').textContent =
        user.first_name ? `${user.first_name} ${user.last_name}` : user.username
    }
  } catch {
    // Ignore
  }
}

// ── Type selector ─────────────────────────────────────────────────────────────
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => setType(btn.dataset.type))
})

function setType(type) {
  currentType = type
  document.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type)
  })
  const noteFields = document.getElementById('note-fields')
  noteFields.classList.toggle('visible', type === 'note')
}

// ── Save ──────────────────────────────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', async () => {
  const title = document.getElementById('card-title').value.trim()
  const noteBody = document.getElementById('note-body').value.trim()

  if (!title) {
    showStatus('error', 'Please enter a title')
    return
  }

  const cardData = {
    type: currentType,
    title,
    url: currentType !== 'note' ? currentTab?.url : undefined,
    body: currentType === 'note' ? noteBody : undefined,
  }

  showStatus('loading', 'Saving...')
  document.getElementById('save-btn').disabled = true

  try {
    const response = await fetch(`${settings.serverUrl}/api/cards/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.accessToken}`,
      },
      body: JSON.stringify(cardData),
    })

    if (response.status === 401) {
      showStatus('error', 'Session expired. Please login again.')
      setTimeout(() => chrome.runtime.openOptionsPage(), 1500)
      return
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.detail || `Error ${response.status}`)
    }

    showStatus('success', '✓ Saved to MindVault!')
    setTimeout(() => window.close(), 1200)
  } catch (err) {
    showStatus('error', err.message || 'Failed to save')
    document.getElementById('save-btn').disabled = false
  }
})

// ── Open Vault ────────────────────────────────────────────────────────────────
document.getElementById('open-vault').addEventListener('click', () => {
  if (settings.serverUrl) {
    chrome.tabs.create({ url: settings.serverUrl })
  }
})

// ── Settings ──────────────────────────────────────────────────────────────────
document.getElementById('open-settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage()
})
document.getElementById('go-to-settings')?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(type, message) {
  const el = document.getElementById('status')
  el.className = `status ${type}`
  el.innerHTML = type === 'loading'
    ? `<div class="spinner"></div><span>${message}</span>`
    : `<span>${message}</span>`
}

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['serverUrl', 'accessToken', 'refreshToken', 'username'], resolve)
  })
}
