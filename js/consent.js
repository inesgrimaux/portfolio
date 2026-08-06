/**
 * consent.js - Discreet cookie consent banner + gated Google Tag Manager loading.
 * Pages that load GTM must define window.loadGTM (no auto-invocation); this
 * script decides when it is safe to call it.
 */
(function () {
    var STORAGE_KEY = 'cookieConsent';
    var ROOT_PREFIX = /\/series\//.test(location.pathname) ? '../' : '';

    function getConsent() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function setConsent(value) {
        localStorage.setItem(STORAGE_KEY, value);
    }

    function maybeLoadGTM() {
        if (getConsent() === 'accepted' && typeof window.loadGTM === 'function' && !window.__gtmLoaded) {
            window.__gtmLoaded = true;
            window.loadGTM();
        }
    }

    function applyTranslationsIfReady() {
        if (typeof i18n !== 'undefined' && typeof i18n.applyTranslations === 'function') {
            i18n.applyTranslations();
        }
    }

    function buildBanner() {
        var existing = document.querySelector('.cookie-banner');
        if (existing) return existing;

        var banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');

        var text = document.createElement('p');
        text.setAttribute('data-i18n', 'cookie_banner_text');
        text.textContent = "This site uses cookies to understand how it's used. You can accept or decline analytics cookies at any time.";
        text.appendChild(document.createTextNode(' '));

        var link = document.createElement('a');
        link.href = ROOT_PREFIX + 'cookie-policy.html';
        link.setAttribute('data-i18n', 'cookie_learn_more');
        link.textContent = 'Learn more';
        text.appendChild(link);

        var actions = document.createElement('div');
        actions.className = 'cookie-banner-actions';

        var rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'cookie-reject';
        rejectBtn.setAttribute('data-i18n', 'cookie_reject');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', function () {
            setConsent('rejected');
            hideBanner();
        });

        var acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.className = 'cookie-accept';
        acceptBtn.setAttribute('data-i18n', 'cookie_accept');
        acceptBtn.textContent = 'Accept';
        acceptBtn.addEventListener('click', function () {
            setConsent('accepted');
            hideBanner();
            maybeLoadGTM();
        });

        actions.appendChild(rejectBtn);
        actions.appendChild(acceptBtn);
        banner.appendChild(text);
        banner.appendChild(actions);
        document.body.appendChild(banner);
        return banner;
    }

    function showBanner() {
        var banner = buildBanner();
        applyTranslationsIfReady();
        requestAnimationFrame(function () {
            banner.classList.add('visible');
        });
    }

    function hideBanner() {
        var banner = document.querySelector('.cookie-banner');
        if (banner) banner.classList.remove('visible');
    }

    // Exposed for the "Manage Cookies" link in the footer of every page.
    window.reopenCookieBanner = function () {
        showBanner();
        return false;
    };

    function init() {
        var consent = getConsent();
        if (consent === 'accepted') {
            maybeLoadGTM();
        } else if (consent !== 'rejected') {
            showBanner();
        }
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
