// i18n Helper - Internacionalização
// Sistema de tradução com suporte a mudança manual de idioma

let currentLanguage = chrome.i18n.getUILanguage().replace('-', '_');
let translations = {};

// Carregar traduções de um idioma específico
async function loadTranslations(lang) {
    const langMap = {
        'pt_BR': 'pt_BR',
        'pt': 'pt_BR',
        'zh_CN': 'zh_CN',
        'zh': 'zh_CN',
        'en': 'en'
    };
    
    const normalizedLang = langMap[lang] || 'en';
    
    try {
        const url = chrome.runtime.getURL(`_locales/${normalizedLang}/messages.json`);
        const response = await fetch(url);
        const data = await response.json();
        
        translations = {};
        for (const [key, value] of Object.entries(data)) {
            translations[key] = value.message;
        }
        
        currentLanguage = normalizedLang;
        return true;
    } catch (e) {
        console.error('Failed to load translations:', e);
        return false;
    }
}

function i18n(key) {
    return translations[key] || chrome.i18n.getMessage(key) || key;
}

// Aplicar traduções na página
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = i18n(key);
        
        if (element.tagName === 'INPUT' && element.type === 'text') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
}

// Inicializar sistema de tradução
async function initI18n() {
    // Carregar idioma salvo ou usar o do navegador
    const { userLanguage } = await chrome.storage.local.get('userLanguage');
    const lang = userLanguage || chrome.i18n.getUILanguage().replace('-', '_');
    
    await loadTranslations(lang);
    applyTranslations();
    
    // Configurar seletor de idioma se existir
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            await chrome.storage.local.set({ userLanguage: newLang });
            await loadTranslations(newLang);
            applyTranslations();
        });
    }
}

// Aplicar traduções quando o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// Exportar para uso global
window.i18n = i18n;
