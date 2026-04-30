/**
 * MindVault Extension — Content Script
 * Extracts page metadata for richer card creation
 */

// Extract OG metadata from the current page
function extractPageMetadata() {
  const getMeta = (name) => {
    const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)
    return el?.getAttribute('content') || ''
  }

  return {
    url: window.location.href,
    title: document.title,
    description: getMeta('og:description') || getMeta('description'),
    ogImage: getMeta('og:image'),
    favicon: getFavicon(),
    selectedText: window.getSelection()?.toString() || '',
  }
}

function getFavicon() {
  const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
  if (link) return link.href
  return `${window.location.origin}/favicon.ico`
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_METADATA') {
    sendResponse(extractPageMetadata())
  }
  if (message.type === 'GET_SELECTION') {
    sendResponse({ text: window.getSelection()?.toString() || '' })
  }
})
