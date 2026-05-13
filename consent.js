/**
 * Cookie Consent & Google Consent Mode v2
 * For GDPR / ePrivacy compliance with Google AdSense
 * Matches dark theme of the site
 */
(function() {
  'use strict';

  const CONSENT_KEY = 'site_consent';
  const CONSENT_VERSION = 2;

  // --- Google Consent Mode v2 Defaults ---
  // Must be set BEFORE AdSense loads
  function setDefaultConsent() {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      personalization_storage: 'denied',
      wait_for_update: 2000
    });
  }

  // --- Update consent state based on user choice ---
  function updateConsent(accepted) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    if (accepted) {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
        personalization_storage: 'granted'
      });
    } else {
      gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        personalization_storage: 'denied'
      });
    }
  }

  // --- Check if consent was already given ---
  function getStoredConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.version === CONSENT_VERSION && data.timestamp) {
          // Consent expires after 1 year
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          if (Date.now() - data.timestamp < oneYear) {
            return data.accepted;
          }
        }
      }
    } catch (e) {
      // localStorage not available or corrupted
    }
    return null;
  }

  // --- Save consent preference ---
  function saveConsent(accepted) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        accepted: accepted,
        version: CONSENT_VERSION,
        timestamp: Date.now()
      }));
    } catch (e) {
      // localStorage not available
    }
  }

  // --- Show the consent banner ---
  function showBanner() {
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie Consent');

    banner.innerHTML = `
      <div class="consent-content">
        <div class="consent-text">
          <strong>🍪 Cookie Consent</strong>
          <p>We use cookies and similar technologies to show you personalized ads.
          Choose "Accept All" to allow ad personalization, or "Reject All" to see only non-personalized ads.
          <a href="/privacy.html" target="_blank" rel="noopener">Learn more</a></p>
        </div>
        <div class="consent-buttons">
          <button id="consent-reject" class="consent-btn consent-btn-secondary">Reject All</button>
          <button id="consent-accept" class="consent-btn consent-btn-primary">Accept All</button>
        </div>
      </div>
    `;

    // Apply styles
    const style = document.createElement('style');
    style.textContent = `
      #cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        background: #1a1a1a;
        border-top: 1px solid #333;
        padding: 16px 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #ccc;
        font-size: 14px;
        line-height: 1.5;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
        transform: translateY(100%);
        transition: transform 0.4s ease;
      }
      #cookie-consent-banner.active {
        transform: translateY(0);
      }
      .consent-content {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
      }
      .consent-text {
        flex: 1;
        min-width: 260px;
      }
      .consent-text strong {
        color: #fff;
        display: block;
        margin-bottom: 4px;
      }
      .consent-text p {
        margin: 0;
        color: #999;
      }
      .consent-text a {
        color: #6c5ce7;
        text-decoration: none;
      }
      .consent-text a:hover {
        text-decoration: underline;
      }
      .consent-buttons {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }
      .consent-btn {
        padding: 10px 22px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
      }
      .consent-btn-primary {
        background: #6c5ce7;
        color: #fff;
      }
      .consent-btn-primary:hover {
        background: #5a4bd1;
      }
      .consent-btn-secondary {
        background: #333;
        color: #ccc;
      }
      .consent-btn-secondary:hover {
        background: #444;
      }

      @media (max-width: 600px) {
        .consent-content {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }
        .consent-buttons {
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Trigger slide-in
    requestAnimationFrame(() => {
      banner.classList.add('active');
    });

    // Handle Accept
    document.getElementById('consent-accept').addEventListener('click', function() {
      saveConsent(true);
      updateConsent(true);
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 400);
    });

    // Handle Reject
    document.getElementById('consent-reject').addEventListener('click', function() {
      saveConsent(false);
      updateConsent(false);
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 400);
    });
  }

  // --- Initialize ---
  setDefaultConsent();

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      const stored = getStoredConsent();
      if (stored !== null) {
        updateConsent(stored);
      } else {
        showBanner();
      }
    });
  } else {
    const stored = getStoredConsent();
    if (stored !== null) {
      updateConsent(stored);
    } else {
      showBanner();
    }
  }
})();
