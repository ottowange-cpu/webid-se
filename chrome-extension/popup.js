// WebID Scam Blocker - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
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

  // Load current status
  const loadStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getStatus' });
      protectionToggle.checked = response.enabled;
      updateStatusUI(response.enabled);
    } catch (error) {
      console.error('Failed to load status:', error);
    }

    // Load stats
    const stats = await chrome.storage.local.get(['blockedCount', 'scansToday', 'lastScanDate']);
    const today = new Date().toDateString();
    
    blockedCount.textContent = stats.blockedCount || 0;
    
    if (stats.lastScanDate === today) {
      scansToday.textContent = stats.scansToday || 0;
    } else {
      scansToday.textContent = 0;
      await chrome.storage.local.set({ scansToday: 0, lastScanDate: today });
    }
  };

  // Update UI based on protection status
  const updateStatusUI = (enabled) => {
    if (enabled) {
      statusCard.className = 'status-card active';
      statusIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      `;
      statusTitle.textContent = 'Skydd aktivt';
      statusDesc.textContent = 'Du är skyddad mot bedrägerisidor';
    } else {
      statusCard.className = 'status-card inactive';
      statusIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>
      `;
      statusTitle.textContent = 'Skydd inaktivt';
      statusDesc.textContent = 'Aktivera för att skydda dig';
    }
  };

  // Toggle protection
  protectionToggle.addEventListener('change', async () => {
    const enabled = protectionToggle.checked;
    await chrome.runtime.sendMessage({ type: 'toggleProtection', enabled });
    updateStatusUI(enabled);
  });

  // Check URL
  checkBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!url) {
      checkResult.innerHTML = '<span class="warning">Ange en URL att kontrollera</span>';
      return;
    }

    // Add protocol if missing
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    checkResult.innerHTML = '<span class="analyzing">Analyserar...</span>';
    checkBtn.disabled = true;

    try {
      const result = await chrome.runtime.sendMessage({ 
        type: 'analyzeUrl', 
        url: fullUrl 
      });

      // Update scan count
      const stats = await chrome.storage.local.get(['scansToday', 'lastScanDate']);
      const today = new Date().toDateString();
      const newCount = (stats.lastScanDate === today ? stats.scansToday || 0 : 0) + 1;
      await chrome.storage.local.set({ scansToday: newCount, lastScanDate: today });
      scansToday.textContent = newCount;

      if (result.safe) {
        checkResult.innerHTML = `
          <div class="result safe">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <div>
              <strong>Säker webbplats</strong>
              <p>${result.reason || 'Inga hot hittades'}</p>
            </div>
          </div>
        `;
      } else if (result.risk_level === 'high') {
        checkResult.innerHTML = `
          <div class="result danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div>
              <strong>Farlig webbplats!</strong>
              <p>${result.reason || 'Misstänkt bedrägeri'}</p>
              <span class="category">${result.category || 'Okänd kategori'}</span>
            </div>
          </div>
        `;
      } else {
        checkResult.innerHTML = `
          <div class="result warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <strong>Var försiktig</strong>
              <p>${result.reason || 'Möjlig risk'}</p>
            </div>
          </div>
        `;
      }
    } catch (error) {
      checkResult.innerHTML = '<span class="error">Kunde inte analysera URL</span>';
    }

    checkBtn.disabled = false;
  });

  // Allow Enter key to trigger check
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      checkBtn.click();
    }
  });

  // Initial load
  await loadStatus();
});
