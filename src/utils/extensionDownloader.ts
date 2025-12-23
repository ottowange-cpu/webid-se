// Chrome extension download utility - creates a downloadable data URL

const manifestJson = `{
  "manifest_version": 3,
  "name": "Web Guard AI",
  "version": "1.0.0",
  "description": "Skyddar dig mot bedrägerier, phishing och farliga webbplatser med AI",
  "permissions": ["storage", "webNavigation", "tabs"],
  "host_permissions": ["<all_urls>"],
  "background": { "service_worker": "background.js" },
  "action": {
    "default_popup": "popup.html",
    "default_icon": { "128": "icon.svg" }
  },
  "icons": { "128": "icon.svg" }
}`;

const backgroundJs = `const API_URL = 'https://zotvdjgxsrzswmaalujv.supabase.co/functions/v1/analyze-url';
const urlCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;
const SAFE_DOMAINS = ['google.com','google.se','youtube.com','facebook.com','twitter.com','x.com','instagram.com','linkedin.com','github.com','microsoft.com','apple.com','amazon.com','wikipedia.org','reddit.com','netflix.com','spotify.com','bankid.com','swish.nu','klarna.com','svt.se'];

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

async function analyzeUrl(url) {
  const cached = getCachedResult(url);
  if (cached) return cached;
  try {
    const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    if (!response.ok) return { safe: true, riskLevel: 'unknown', shouldBlock: false };
    const result = await response.json();
    urlCache.set(url, { result, timestamp: Date.now() });
    return result;
  } catch { return { safe: true, riskLevel: 'unknown', shouldBlock: false }; }
}

async function updateBadge(tabId, status) {
  const colors = { safe: '#22c55e', warning: '#eab308', danger: '#ef4444', analyzing: '#3b82f6', disabled: '#6b7280' };
  const text = { safe: '✓', warning: '!', danger: '✕', analyzing: '...', disabled: 'OFF' };
  try {
    await chrome.action.setBadgeBackgroundColor({ color: colors[status] || colors.safe, tabId });
    await chrome.action.setBadgeText({ text: text[status] || '', tabId });
  } catch {}
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const enabled = await isProtectionEnabled();
  if (!enabled) { await updateBadge(details.tabId, 'disabled'); return; }
  const url = details.url;
  if (!url.startsWith('http')) return;
  if (url.includes(chrome.runtime.id)) return;
  if (isSafeDomain(url)) { await updateBadge(details.tabId, 'safe'); return; }
  await updateBadge(details.tabId, 'analyzing');
  const result = await analyzeUrl(url);
  const shouldBlock = result.shouldBlock === true || (!result.safe && result.riskLevel === 'high');
  if (shouldBlock) {
    await updateBadge(details.tabId, 'danger');
    await chrome.storage.local.set({ lastBlocked: { url, category: result.category || 'Farlig', timestamp: Date.now() } });
    const storage = await chrome.storage.local.get(['blockedCount']);
    await chrome.storage.local.set({ blockedCount: (storage.blockedCount || 0) + 1 });
    chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url) });
  } else if (!result.safe && result.riskLevel === 'medium') {
    await updateBadge(details.tabId, 'warning');
  } else {
    await updateBadge(details.tabId, 'safe');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStatus') {
    Promise.all([isProtectionEnabled(), chrome.storage.local.get(['blockedCount'])]).then(([enabled, storage]) => {
      sendResponse({ enabled, blockedCount: storage.blockedCount || 0 });
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
});`;

const popupHtml = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <title>Web Guard AI</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0f;color:#fff;width:320px;padding:16px}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.logo{display:flex;align-items:center;gap:8px}.logo svg{width:24px;height:24px;color:#3b82f6}.logo-text{font-size:16px;font-weight:700;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.version{font-size:11px;color:#6b7280;background:#1f2937;padding:2px 8px;border-radius:10px}.status-card{display:flex;align-items:center;gap:12px;padding:16px;border-radius:12px;margin-bottom:16px;background:linear-gradient(135deg,rgba(34,197,94,.15),rgba(34,197,94,.05));border:1px solid rgba(34,197,94,.3)}.status-card.inactive{background:linear-gradient(135deg,rgba(107,114,128,.15),rgba(107,114,128,.05));border-color:rgba(107,114,128,.3)}.status-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(34,197,94,.2);color:#22c55e}.status-card.inactive .status-icon{background:rgba(107,114,128,.2);color:#6b7280}.status-icon svg{width:28px;height:28px}.status-text h2{font-size:16px;font-weight:600;margin-bottom:2px}.status-text p{font-size:12px;color:#9ca3af}.toggle-container{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#1f2937;border-radius:10px;margin-bottom:16px}.toggle{position:relative;width:44px;height:24px}.toggle input{opacity:0;width:0;height:0}.toggle-slider{position:absolute;cursor:pointer;inset:0;background:#374151;transition:.3s;border-radius:24px}.toggle-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background:#fff;transition:.3s;border-radius:50%}.toggle input:checked+.toggle-slider{background:linear-gradient(135deg,#3b82f6,#8b5cf6)}.toggle input:checked+.toggle-slider:before{transform:translateX(20px)}.stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}.stat{background:#1f2937;padding:12px;border-radius:10px;text-align:center}.stat-value{display:block;font-size:24px;font-weight:700;color:#3b82f6}.stat-label{font-size:11px;color:#9ca3af}.url-check{background:#1f2937;padding:16px;border-radius:12px}.url-check h3{font-size:14px;font-weight:600;margin-bottom:12px}.input-group{display:flex;gap:8px}.input-group input{flex:1;padding:10px 12px;border:1px solid #374151;border-radius:8px;background:#0a0a0f;color:#fff;font-size:13px;outline:none}.input-group input:focus{border-color:#3b82f6}.input-group button{padding:10px 16px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:500;cursor:pointer}.check-result{margin-top:12px}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
      <span class="logo-text">Web Guard AI</span>
    </div>
    <span class="version">v1.0</span>
  </div>
  <div class="status-card" id="statusCard">
    <div class="status-icon" id="statusIcon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></div>
    <div class="status-text"><h2 id="statusTitle">Skydd aktivt</h2><p id="statusDesc">Du är skyddad</p></div>
  </div>
  <div class="toggle-container">
    <span>Aktivera skydd</span>
    <label class="toggle"><input type="checkbox" id="protectionToggle" checked><span class="toggle-slider"></span></label>
  </div>
  <div class="stats">
    <div class="stat"><span class="stat-value" id="blockedCount">0</span><span class="stat-label">Blockerade</span></div>
    <div class="stat"><span class="stat-value" id="scansToday">0</span><span class="stat-label">Skanningar</span></div>
  </div>
  <div class="url-check">
    <h3>Kontrollera URL</h3>
    <div class="input-group"><input type="text" id="urlInput" placeholder="Klistra in länk..."><button id="checkBtn">Kolla</button></div>
    <div class="check-result" id="checkResult"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

const popupJs = `document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('protectionToggle');
  const statusCard = document.getElementById('statusCard');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');
  const blockedCount = document.getElementById('blockedCount');
  const urlInput = document.getElementById('urlInput');
  const checkBtn = document.getElementById('checkBtn');
  const checkResult = document.getElementById('checkResult');

  const updateUI = (enabled) => {
    statusCard.className = enabled ? 'status-card' : 'status-card inactive';
    statusTitle.textContent = enabled ? 'Skydd aktivt' : 'Skydd inaktivt';
    statusDesc.textContent = enabled ? 'Du är skyddad' : 'Aktivera för skydd';
  };

  try {
    const response = await chrome.runtime.sendMessage({ type: 'getStatus' });
    toggle.checked = response.enabled;
    blockedCount.textContent = response.blockedCount || 0;
    updateUI(response.enabled);
  } catch {}

  toggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({ type: 'toggleProtection', enabled: toggle.checked });
    updateUI(toggle.checked);
  });

  checkBtn.addEventListener('click', async () => {
    let url = urlInput.value.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    checkResult.innerHTML = '<span style="color:#3b82f6">Analyserar...</span>';
    checkBtn.disabled = true;
    try {
      const result = await chrome.runtime.sendMessage({ type: 'analyzeUrl', url });
      if (result.safe) {
        checkResult.innerHTML = '<span style="color:#22c55e">✓ Säker</span>';
      } else if (result.riskLevel === 'high') {
        checkResult.innerHTML = '<span style="color:#ef4444">✕ Farlig!</span>';
      } else {
        checkResult.innerHTML = '<span style="color:#eab308">⚠ Varning</span>';
      }
    } catch { checkResult.innerHTML = '<span style="color:#ef4444">Fel</span>'; }
    checkBtn.disabled = false;
  });
});`;

const blockedHtml = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <title>Blockerad</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#0a0a0f,#1a1a2e);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.container{max-width:500px;text-align:center}.shield{width:120px;height:120px;margin:0 auto 24px;background:rgba(239,68,68,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(239,68,68,.3)}.shield svg{width:60px;height:60px;color:#ef4444}h1{font-size:28px;color:#ef4444;margin-bottom:12px}.subtitle{color:#9ca3af;margin-bottom:32px}.url-box{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:12px;padding:16px;margin-bottom:24px;word-break:break-all}.url-box .url{color:#ef4444;font-family:monospace}.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.btn{padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;text-decoration:none}.btn-primary{background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff}.btn-secondary{background:#374151;color:#fff}
  </style>
</head>
<body>
  <div class="container">
    <div class="shield"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
    <h1>Blockerad</h1>
    <p class="subtitle">Denna sida är farlig</p>
    <div class="url-box"><div class="url" id="blockedUrl">...</div></div>
    <div class="actions">
      <a href="javascript:history.back()" class="btn btn-primary">Gå tillbaka</a>
      <a href="https://google.com" class="btn btn-secondary">Google</a>
    </div>
  </div>
  <script>
    const params = new URLSearchParams(window.location.search);
    document.getElementById('blockedUrl').textContent = params.get('url') || 'Okänd';
  </script>
</body>
</html>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" stroke="#22c55e"/></svg>`;

export function downloadExtensionFile(filename: string): void {
  const files: Record<string, string> = {
    'manifest.json': manifestJson,
    'background.js': backgroundJs,
    'popup.html': popupHtml,
    'popup.js': popupJs,
    'blocked.html': blockedHtml,
    'icon.svg': iconSvg
  };

  const content = files[filename];
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAllExtensionFiles(): void {
  const files = ['manifest.json', 'background.js', 'popup.html', 'popup.js', 'blocked.html', 'icon.svg'];
  files.forEach((file, index) => {
    setTimeout(() => downloadExtensionFile(file), index * 300);
  });
}
