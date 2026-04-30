/**
 * MindVault Extension — Options Page Script
 */

// ── Load saved settings ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await getSettings()

  if (settings.serverUrl) {
    document.getElementById('server-url').value = settings.serverUrl
  }
  if (settings.username) {
    document.getElementById('username').value = settings.username
  }

  if (settings.accessToken) {
    showConnected(settings.username || 'user')
  }
})

// ── Connect ───────────────────────────────────────────────────────────────────
document.getElementById('connect-btn').addEventListener('click', async () => {
  const serverUrl = document.getElementById('server-url').value.trim().replace(/\/$/, '')
  const username  = document.getElementById('username').value.trim()
  const password  = document.getElementById('password').value

  if (!serverUrl || !username || !password) {
    showStatus('error', 'Please fill in all fields')
    return
  }

  const btn = document.getElementById('connect-btn')
  btn.disabled = true
  btn.textContent = 'Connecting...'
  showStatus('', '')

  try {
    const response = await fetch(`${serverUrl}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.detail || 'Invalid credentials')
    }

    const { access, refresh } = await response.json()

    await chrome.storage.sync.set({
      serverUrl,
      username,
      accessToken: access,
      refreshToken: refresh,
    })

    document.getElementById('password').value = ''
    showConnected(username)
    showStatus('success', `✓ Connected to ${serverUrl}`)
  } catch (err) {
    showStatus('error', err.message || 'Connection failed')
  } finally {
    btn.disabled = false
    btn.textContent = 'Connect to MindVault'
  }
})

// ── Disconnect ────────────────────────────────────────────────────────────────
document.getElementById('disconnect-btn').addEventListener('click', async () => {
  await chrome.storage.sync.remove(['accessToken', 'refreshToken', 'username'])
  document.getElementById('connected-info').classList.remove('visible')
  document.getElementById('disconnect-btn').style.display = 'none'
  document.getElementById('connect-btn').style.display = 'block'
  showStatus('success', 'Disconnected')
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function showConnected(username) {
  document.getElementById('connected-text').textContent = `Connected as ${username}`
  document.getElementById('connected-info').classList.add('visible')
  document.getElementById('disconnect-btn').style.display = 'block'
  document.getElementById('connect-btn').style.display = 'none'
}

function showStatus(type, message) {
  const el = document.getElementById('status')
  el.className = `status ${type}`
  el.textContent = message
}

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['serverUrl', 'accessToken', 'refreshToken', 'username'], resolve)
  })
}
