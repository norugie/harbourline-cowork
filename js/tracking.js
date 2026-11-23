// Tracking events for Google Tag Manager (GTM) and other analytics platforms. This file is loaded on every page.

const debug =
    ['localhost', '127.0.0.1', ''].includes(window.location.hostname) ||
    new URLSearchParams(window.location.search).has('debug_tracking');

window.dataLayer = window.dataLayer || [];

function track(event, params = {}) {
    const payload = { event, ...params };
    window.dataLayer.push(payload);
    if (debug) console.info('[dataLayer]', payload);
}

// Track an event, then continue after the callback or a timeout.
function trackThenContinue(event, params = {}, timeout = 1500) {
    return new Promise((resolve) => {
        let finished = false;
        const finish = () => {
            if (!finished) {
                finished = true;
                resolve();
            }
        };

        // If GTM isn't loaded, just fire the event and continue.
        if (!window.google_tag_manager) {
            track(event, params);
            finish();
            return;
        }

        track(event, { ...params, eventCallback: finish, eventTimeout: timeout });
        setTimeout(finish, timeout + 100);
    });
}

// Capture UTM and ad click IDs from the URL, or from sessionStorage if the visitor returns to the site later. Returns an object with the captured values.
const ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'gbraid',
    'wbraid',
];
const ATTRIBUTION_STORAGE_KEY = 'hl_attribution';

function captureAttribution() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {};

    ATTRIBUTION_KEYS.forEach((key) => {
        const value = params.get(key);
        if (value) fromUrl[key] = value.slice(0, 200);
    });

    try {
        if (Object.keys(fromUrl).length) {
            sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fromUrl));
            return fromUrl;
        }
        return JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)) || {};
    } catch {
        return fromUrl;
    }
}

// Track clicks on phone links, email links, and CTA buttons. The CTA's data-cta attribute is used as the event parameter; the text content is also sent for context.
function initClickTracking() {
    document.addEventListener('click', (event) => {
        const el = event.target.closest('a, button');
        if (!el) return;

        const section = el.closest('[data-track-section]')?.dataset.trackSection || 'unknown';
        const href = el.getAttribute('href') || '';

        if (href.startsWith('tel:')) {
            track('phone_click', { link_location: section });
        } else if (href.startsWith('mailto:')) {
            track('email_click', { link_location: section });
        } else if (el.dataset.cta) {
            track('cta_click', {
                cta_id: el.dataset.cta,
                cta_text: el.textContent.trim().slice(0, 100),
                cta_location: section,
            });
        }
    });
}
