/**
 * i18n.js - Lightweight Internationalization for Ines Grimaux Website
 */

const i18n = {
    translations: {},
    currentLang: 'en',
    supportedLangs: ['en', 'es', 'pt'],

    async init() {
        try {
            // Resolve path relative to site root
            const basePath = document.querySelector('script[src*="i18n.js"]').src;
            const rootPath = basePath.substring(0, basePath.lastIndexOf('/js/'));
            const response = await fetch(rootPath + '/translations.json');
            this.translations = await response.json();
            
            // 1. Check local storage
            let savedLang = localStorage.getItem('preferredLanguage');
            
            // 2. If not saved, check browser language
            if (!savedLang) {
                const browserLang = navigator.language.split('-')[0];
                savedLang = this.supportedLangs.includes(browserLang) ? browserLang : 'en';
            }

            this.setLanguage(savedLang);
        } catch (error) {
            console.error('Error initializing i18n:', error);
        }
    },

    setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) lang = 'en';
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        document.documentElement.lang = lang;
        this.applyTranslations();
        this.updateActiveSwitcher(lang);
    },

    applyTranslations() {
        // Text content
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
                el.innerText = this.translations[this.currentLang][key];
            }
        });

        // Placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
                el.placeholder = this.translations[this.currentLang][key];
            }
        });
    },

    updateActiveSwitcher(lang) {
        const links = document.querySelectorAll('.lang-switcher a');
        links.forEach(link => {
            if (link.getAttribute('onclick').includes(`'${lang}'`)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});
