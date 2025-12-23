// Lazy load JSZip to avoid React context issues

// Chrome extension files content (embedded for direct download)
const extensionFiles = {
  'manifest.json': `{
  "manifest_version": 3,
  "name": "Web Guard AI",
  "version": "1.0.0",
  "description": "Skyddar dig mot bedrägerier, phishing och farliga webbplatser med AI",
  "permissions": [
    "storage",
    "webNavigation",
    "tabs"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon128.png",
      "48": "icons/icon128.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon128.png",
    "48": "icons/icon128.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["blocked.html"],
      "matches": ["<all_urls>"]
    }
  ]
}`,

  'background.js': `// Web Guard AI - Background Service Worker

const API_URL = 'https://zotvdjgxsrzswmaalujv.supabase.co/functions/v1/analyze-url';

const urlCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const SAFE_DOMAINS = [
  'google.com', 'google.se', 'youtube.com', 'facebook.com',
  'twitter.com', 'x.com', 'instagram.com', 'linkedin.com',
  'github.com', 'microsoft.com', 'apple.com', 'amazon.com',
  'amazon.se', 'wikipedia.org', 'reddit.com', 'netflix.com',
  'spotify.com', 'bankid.com', 'swish.nu', 'klarna.com',
  'postnord.se', 'skatteverket.se', 'forsakringskassan.se',
  'svt.se', 'aftonbladet.se', 'expressen.se', 'dn.se', 'svd.se'
];

async function isProtectionEnabled() {
  const result = await chrome.storage.local.get(['protectionEnabled']);
  return result.protectionEnabled !== false;
}

function isSafeDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SAFE_DOMAINS.some(safe => hostname === safe || hostname.endsWith('.' + safe));
  } catch { return false; }
}

function getCachedResult(url) {
  const cached = urlCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.result;
  urlCache.delete(url);
  return null;
}

function cacheResult(url, result) {
  urlCache.set(url, { result, timestamp: Date.now() });
}

async function analyzeUrl(url) {
  const cached = getCachedResult(url);
  if (cached) return cached;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!response.ok) return { safe: true, riskLevel: 'unknown', shouldBlock: false };
    const result = await response.json();
    cacheResult(url, result);
    return result;
  } catch (error) {
    return { safe: true, riskLevel: 'unknown', shouldBlock: false };
  }
}

async function updateBadge(tabId, status) {
  const colors = { safe: '#22c55e', warning: '#eab308', danger: '#ef4444', analyzing: '#3b82f6', disabled: '#6b7280' };
  const text = { safe: '✓', warning: '!', danger: '✕', analyzing: '...', disabled: 'OFF' };
  try {
    await chrome.action.setBadgeBackgroundColor({ color: colors[status] || colors.safe, tabId });
    await chrome.action.setBadgeText({ text: text[status] || '', tabId });
  } catch (error) {}
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const enabled = await isProtectionEnabled();
  if (!enabled) { await updateBadge(details.tabId, 'disabled'); return; }
  const url = details.url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  if (url.includes(chrome.runtime.id)) return;
  if (isSafeDomain(url)) { await updateBadge(details.tabId, 'safe'); return; }
  await updateBadge(details.tabId, 'analyzing');
  const result = await analyzeUrl(url);
  const shouldBlock = result.shouldBlock === true || (!result.safe && result.riskLevel === 'high');
  if (shouldBlock) {
    await updateBadge(details.tabId, 'danger');
    await chrome.storage.local.set({
      lastBlocked: { url, reasons: result.reasons || [], category: result.category || 'Farlig', recommendation: result.recommendation || 'Undvik denna webbplats', timestamp: Date.now() }
    });
    const storage = await chrome.storage.local.get(['blockedCount']);
    await chrome.storage.local.set({ blockedCount: (storage.blockedCount || 0) + 1 });
    chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url) });
  } else if (!result.safe && result.riskLevel === 'medium') {
    await updateBadge(details.tabId, 'warning');
  } else {
    await updateBadge(details.tabId, 'safe');
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const enabled = await isProtectionEnabled();
  if (!enabled) { await updateBadge(details.tabId, 'disabled'); return; }
  const url = details.url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  if (isSafeDomain(url)) { await updateBadge(details.tabId, 'safe'); return; }
  const cached = getCachedResult(url);
  if (cached) {
    const shouldBlock = cached.shouldBlock === true || (!cached.safe && cached.riskLevel === 'high');
    if (shouldBlock) await updateBadge(details.tabId, 'danger');
    else if (!cached.safe && cached.riskLevel === 'medium') await updateBadge(details.tabId, 'warning');
    else await updateBadge(details.tabId, 'safe');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStatus') {
    Promise.all([isProtectionEnabled(), chrome.storage.local.get(['blockedCount', 'lastBlocked'])]).then(([enabled, storage]) => {
      sendResponse({ enabled, blockedCount: storage.blockedCount || 0, lastBlocked: storage.lastBlocked });
    });
    return true;
  }
  if (message.type === 'toggleProtection') {
    chrome.storage.local.set({ protectionEnabled: message.enabled }).then(() => sendResponse({ success: true }));
    return true;
  }
  if (message.type === 'analyzeUrl') {
    analyzeUrl(message.url).then(result => sendResponse(result));
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ protectionEnabled: true, blockedCount: 0 });
});`,

  'popup.html': `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Guard AI</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="popup">
    <header class="header">
      <div class="logo">
        <svg class="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span class="logo-text">Web Guard AI</span>
      </div>
      <span class="version">v1.0</span>
    </header>
    <main class="content">
      <div class="status-card" id="statusCard">
        <div class="status-icon" id="statusIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <div class="status-text">
          <h2 id="statusTitle">Skydd aktivt</h2>
          <p id="statusDesc">Du är skyddad mot bedrägerisidor</p>
        </div>
      </div>
      <div class="toggle-container">
        <span class="toggle-label">Aktivera skydd</span>
        <label class="toggle">
          <input type="checkbox" id="protectionToggle" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-value" id="blockedCount">0</span>
          <span class="stat-label">Blockerade hot</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="scansToday">0</span>
          <span class="stat-label">Skanningar idag</span>
        </div>
      </div>
      <div class="url-check">
        <h3>Kontrollera URL</h3>
        <div class="input-group">
          <input type="text" id="urlInput" placeholder="Klistra in länk här...">
          <button id="checkBtn">Kontrollera</button>
        </div>
        <div class="check-result" id="checkResult"></div>
      </div>
    </main>
    <footer class="footer">
      <a href="https://webguard.ai" target="_blank">webguard.ai</a>
    </footer>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,

  'popup.js': `document.addEventListener('DOMContentLoaded', async () => {
  const protectionToggle = document.getElementById('protectionToggle');
  const statusCard = document.getElementById('statusCard');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');
  const blockedCount = document.getElementById('blockedCount');
  const scansToday = document.getElementById('scansToday');
  const urlInput = document.getElementById('urlInput');
  const checkBtn = document.getElementById('checkBtn');
  const checkResult = document.getElementById('checkResult');

  const loadStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getStatus' });
      protectionToggle.checked = response.enabled;
      updateStatusUI(response.enabled);
    } catch (error) {}
    const stats = await chrome.storage.local.get(['blockedCount', 'scansToday', 'lastScanDate']);
    const today = new Date().toDateString();
    blockedCount.textContent = stats.blockedCount || 0;
    if (stats.lastScanDate === today) scansToday.textContent = stats.scansToday || 0;
    else { scansToday.textContent = 0; await chrome.storage.local.set({ scansToday: 0, lastScanDate: today }); }
  };

  const updateStatusUI = (enabled) => {
    if (enabled) {
      statusCard.className = 'status-card active';
      statusIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>';
      statusTitle.textContent = 'Skydd aktivt';
      statusDesc.textContent = 'Du är skyddad mot bedrägerisidor';
    } else {
      statusCard.className = 'status-card inactive';
      statusIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
      statusTitle.textContent = 'Skydd inaktivt';
      statusDesc.textContent = 'Aktivera för att skydda dig';
    }
  };

  protectionToggle.addEventListener('change', async () => {
    const enabled = protectionToggle.checked;
    await chrome.runtime.sendMessage({ type: 'toggleProtection', enabled });
    updateStatusUI(enabled);
  });

  checkBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) { checkResult.innerHTML = '<span class="warning">Ange en URL</span>'; return; }
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) fullUrl = 'https://' + url;
    checkResult.innerHTML = '<span class="analyzing">Analyserar...</span>';
    checkBtn.disabled = true;
    try {
      const result = await chrome.runtime.sendMessage({ type: 'analyzeUrl', url: fullUrl });
      const stats = await chrome.storage.local.get(['scansToday', 'lastScanDate']);
      const today = new Date().toDateString();
      const newCount = (stats.lastScanDate === today ? stats.scansToday || 0 : 0) + 1;
      await chrome.storage.local.set({ scansToday: newCount, lastScanDate: today });
      scansToday.textContent = newCount;
      if (result.safe) {
        checkResult.innerHTML = '<div class="result safe"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg><div><strong>Säker</strong><p>Inga hot</p></div></div>';
      } else if (result.riskLevel === 'high') {
        checkResult.innerHTML = '<div class="result danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><div><strong>Farlig!</strong><p>' + (result.category || 'Bedrägeri') + '</p></div></div>';
      } else {
        checkResult.innerHTML = '<div class="result warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><div><strong>Varning</strong><p>Möjlig risk</p></div></div>';
      }
    } catch (error) { checkResult.innerHTML = '<span class="error">Fel</span>'; }
    checkBtn.disabled = false;
  });

  urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkBtn.click(); });
  await loadStatus();
});`,

  'styles.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; min-width: 320px; }
.popup { padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.logo { display: flex; align-items: center; gap: 8px; }
.shield-icon { width: 28px; height: 28px; color: #3b82f6; }
.logo-text { font-size: 16px; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.version { font-size: 11px; color: #6b7280; background: #1f2937; padding: 2px 8px; border-radius: 10px; }
.status-card { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.status-card.active { background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.3); }
.status-card.inactive { background: linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.05)); border: 1px solid rgba(107, 114, 128, 0.3); }
.status-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.status-card.active .status-icon { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.status-card.inactive .status-icon { background: rgba(107, 114, 128, 0.2); color: #6b7280; }
.status-icon svg { width: 28px; height: 28px; }
.status-text h2 { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
.status-text p { font-size: 12px; color: #9ca3af; }
.toggle-container { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #1f2937; border-radius: 10px; margin-bottom: 16px; }
.toggle-label { font-size: 14px; font-weight: 500; }
.toggle { position: relative; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: 0.3s; border-radius: 24px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%; }
.toggle input:checked + .toggle-slider { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
.toggle input:checked + .toggle-slider:before { transform: translateX(20px); }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.stat { background: #1f2937; padding: 12px; border-radius: 10px; text-align: center; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #3b82f6; }
.stat-label { font-size: 11px; color: #9ca3af; }
.url-check { background: #1f2937; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.url-check h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.input-group { display: flex; gap: 8px; }
.input-group input { flex: 1; padding: 10px 12px; border: 1px solid #374151; border-radius: 8px; background: #0a0a0f; color: white; font-size: 13px; outline: none; }
.input-group input:focus { border-color: #3b82f6; }
.input-group input::placeholder { color: #6b7280; }
.input-group button { padding: 10px 16px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border: none; border-radius: 8px; color: white; font-size: 13px; font-weight: 500; cursor: pointer; }
.input-group button:hover { opacity: 0.9; }
.input-group button:disabled { opacity: 0.5; }
.check-result { margin-top: 12px; min-height: 20px; }
.check-result .analyzing { color: #3b82f6; font-size: 13px; }
.check-result .warning { color: #eab308; font-size: 13px; }
.check-result .error { color: #ef4444; font-size: 13px; }
.result { display: flex; gap: 12px; padding: 12px; border-radius: 8px; align-items: center; }
.result svg { width: 24px; height: 24px; flex-shrink: 0; }
.result strong { display: block; font-size: 13px; }
.result p { font-size: 12px; color: #9ca3af; margin: 0; }
.result.safe { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); }
.result.safe svg { color: #22c55e; }
.result.warning { background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); }
.result.warning svg { color: #eab308; }
.result.danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
.result.danger svg { color: #ef4444; }
.footer { display: flex; justify-content: center; font-size: 11px; color: #6b7280; }
.footer a { color: #6b7280; text-decoration: none; }
.footer a:hover { color: #3b82f6; }`,

  'blocked.html': `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blockerad - Web Guard AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .container { max-width: 500px; text-align: center; }
    .shield { width: 120px; height: 120px; margin: 0 auto 24px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05)); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(239, 68, 68, 0.3); animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .shield svg { width: 60px; height: 60px; color: #ef4444; }
    h1 { font-size: 28px; color: #ef4444; margin-bottom: 12px; }
    .subtitle { font-size: 18px; color: #9ca3af; margin-bottom: 32px; }
    .url-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; word-break: break-all; }
    .url-box label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; }
    .url-box .url { font-size: 14px; color: #ef4444; font-family: monospace; }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; }
    .btn-secondary { background: #374151; color: white; }
    .btn-danger { background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #ef4444; }
    .btn svg { width: 18px; height: 18px; }
    .footer { margin-top: 48px; font-size: 12px; color: #6b7280; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="shield"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
    <h1>Webbplats Blockerad</h1>
    <p class="subtitle">Denna sida har identifierats som farlig</p>
    <div class="url-box"><label>Blockerad URL</label><div class="url" id="blockedUrl">...</div></div>
    <div class="actions">
      <a href="javascript:history.back()" class="btn btn-primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Gå tillbaka</a>
      <a href="https://google.com" class="btn btn-secondary">Till Google</a>
      <button class="btn btn-danger" id="proceedBtn">Fortsätt ändå</button>
    </div>
    <div class="footer"><p>Skyddad av <a href="https://webguard.ai">Web Guard AI</a></p></div>
  </div>
  <script>
    const params = new URLSearchParams(window.location.search);
    const blockedUrl = params.get('url');
    document.getElementById('blockedUrl').textContent = blockedUrl || 'Okänd';
    document.getElementById('proceedBtn').addEventListener('click', () => {
      if (confirm('⚠️ VARNING!\\n\\nDenna webbplats är farlig.\\nFortsätt ändå?') && blockedUrl) {
        window.location.href = blockedUrl;
      }
    });
  </script>
</body>
</html>`
};

// Base64 encoded simple shield icon (128x128 PNG)
const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuOWNjYzRkZTkzLCAyMDIyLzAzLzE0LTE0OjA3OjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuMyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDEtMTVUMTI6MDA6MDArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAxLTE1VDEyOjAwOjAwKzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTAxLTE1VDEyOjAwOjAwKzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiIHhtcE1NOkRvY3VtZW50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';

export async function downloadChromeExtension(): Promise<void> {
  // Dynamically import JSZip to avoid React context issues
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  // Add all text files
  for (const [filename, content] of Object.entries(extensionFiles)) {
    zip.file(filename, content);
  }
  
  // Add icon
  const iconFolder = zip.folder('icons');
  if (iconFolder) {
    // Decode base64 and add as binary
    const iconBinary = atob(iconBase64);
    const iconArray = new Uint8Array(iconBinary.length);
    for (let i = 0; i < iconBinary.length; i++) {
      iconArray[i] = iconBinary.charCodeAt(i);
    }
    iconFolder.file('icon128.png', iconArray);
  }
  
  // Generate zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'web-guard-ai-chrome.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
