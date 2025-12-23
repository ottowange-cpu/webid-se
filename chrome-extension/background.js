// WebID Scam Blocker - Background Service Worker

const API_URL = 'https://zotvdjgxsrzswmaalujv.supabase.co/functions/v1/analyze-url';

// Cache for analyzed URLs to avoid repeated API calls
const urlCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Domains to skip (safe by default)
const SAFE_DOMAINS = [
  'google.com', 'google.se',
  'youtube.com',
  'facebook.com',
  'twitter.com', 'x.com',
  'instagram.com',
  'linkedin.com',
  'github.com',
  'microsoft.com',
  'apple.com',
  'amazon.com', 'amazon.se',
  'wikipedia.org',
  'reddit.com',
  'netflix.com',
  'spotify.com',
  'bankid.com',
  'swish.nu',
  'klarna.com',
  'postnord.se',
  'skatteverket.se',
  'forsakringskassan.se',
  'svt.se',
  'aftonbladet.se',
  'expressen.se',
  'dn.se',
  'svd.se',
  'lovableproject.com',
  'lovable.dev',
  'supabase.co'
];

// Check if protection is enabled
async function isProtectionEnabled() {
  const result = await chrome.storage.local.get(['protectionEnabled']);
  return result.protectionEnabled !== false; // Default to true
}

// Check if domain is in safe list
function isSafeDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SAFE_DOMAINS.some(safe => 
      hostname === safe || hostname.endsWith('.' + safe)
    );
  } catch {
    return false;
  }
}

// Get cached result or null
function getCachedResult(url) {
  const cached = urlCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  urlCache.delete(url);
  return null;
}

// Cache a result
function cacheResult(url, result) {
  urlCache.set(url, {
    result,
    timestamp: Date.now()
  });
}

// Analyze URL with AI
async function analyzeUrl(url) {
  // Check cache first
  const cached = getCachedResult(url);
  if (cached) {
    console.log('Cache hit for:', url);
    return cached;
  }

  console.log('Analyzing URL:', url);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      return { safe: true, riskLevel: 'unknown', shouldBlock: false };
    }

    const result = await response.json();
    console.log('Analysis result:', result);
    cacheResult(url, result);
    return result;
  } catch (error) {
    console.error('Failed to analyze URL:', error);
    return { safe: true, riskLevel: 'unknown', shouldBlock: false };
  }
}

// Update badge based on protection status
async function updateBadge(tabId, status) {
  const colors = {
    safe: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    analyzing: '#3b82f6',
    disabled: '#6b7280'
  };

  const text = {
    safe: '✓',
    warning: '!',
    danger: '✕',
    analyzing: '...',
    disabled: 'OFF'
  };

  try {
    await chrome.action.setBadgeBackgroundColor({ 
      color: colors[status] || colors.safe,
      tabId 
    });
    await chrome.action.setBadgeText({ 
      text: text[status] || '',
      tabId 
    });
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

// Handle navigation - this is where blocking happens
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only handle main frame navigation
  if (details.frameId !== 0) return;

  const enabled = await isProtectionEnabled();
  if (!enabled) {
    await updateBadge(details.tabId, 'disabled');
    return;
  }

  const url = details.url;

  // Skip chrome:// and other internal URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // Skip our own blocked page
  if (url.includes(chrome.runtime.id)) {
    return;
  }

  // Skip safe domains
  if (isSafeDomain(url)) {
    await updateBadge(details.tabId, 'safe');
    return;
  }

  // Show analyzing status
  await updateBadge(details.tabId, 'analyzing');

  // Analyze the URL
  const result = await analyzeUrl(url);

  // Check if we should block based on AI analysis
  const shouldBlock = result.shouldBlock === true || 
                      (!result.safe && result.riskLevel === 'high');

  if (shouldBlock) {
    // Block dangerous sites
    console.log('BLOCKING:', url, 'Reason:', result.category);
    await updateBadge(details.tabId, 'danger');
    
    // Store the blocked URL info for display
    await chrome.storage.local.set({
      lastBlocked: {
        url,
        reasons: result.reasons || [],
        category: result.category || 'Farlig',
        recommendation: result.recommendation || 'Undvik denna webbplats',
        timestamp: Date.now()
      }
    });

    // Update blocked count
    const storage = await chrome.storage.local.get(['blockedCount']);
    await chrome.storage.local.set({ 
      blockedCount: (storage.blockedCount || 0) + 1 
    });

    // Redirect to blocked page
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url)
    });
  } else if (!result.safe && result.riskLevel === 'medium') {
    // Warning for medium risk
    console.log('WARNING:', url, 'Reason:', result.category);
    await updateBadge(details.tabId, 'warning');
  } else {
    await updateBadge(details.tabId, 'safe');
  }
});

// Handle completed navigation to update badge
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const enabled = await isProtectionEnabled();
  if (!enabled) {
    await updateBadge(details.tabId, 'disabled');
    return;
  }

  const url = details.url;
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  if (isSafeDomain(url)) {
    await updateBadge(details.tabId, 'safe');
    return;
  }

  const cached = getCachedResult(url);
  if (cached) {
    const shouldBlock = cached.shouldBlock === true || 
                        (!cached.safe && cached.riskLevel === 'high');
    
    if (shouldBlock) {
      await updateBadge(details.tabId, 'danger');
    } else if (!cached.safe && cached.riskLevel === 'medium') {
      await updateBadge(details.tabId, 'warning');
    } else {
      await updateBadge(details.tabId, 'safe');
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStatus') {
    Promise.all([
      isProtectionEnabled(),
      chrome.storage.local.get(['blockedCount', 'lastBlocked'])
    ]).then(([enabled, storage]) => {
      sendResponse({ 
        enabled,
        blockedCount: storage.blockedCount || 0,
        lastBlocked: storage.lastBlocked
      });
    });
    return true;
  }
  
  if (message.type === 'toggleProtection') {
    chrome.storage.local.set({ protectionEnabled: message.enabled }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'analyzeUrl') {
    analyzeUrl(message.url).then(result => {
      sendResponse(result);
    });
    return true;
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Web Guard AI installed');
  chrome.storage.local.set({ 
    protectionEnabled: true,
    blockedCount: 0
  });
});