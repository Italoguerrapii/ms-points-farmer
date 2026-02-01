// i18n Helper - Internacionalização
// Carrega automaticamente as traduções com base no idioma do navegador

function i18n(key) {
    return chrome.i18n.getMessage(key) || key;
}

// Aplicar traduções na página
function applyTranslations() {
    // Traduzir elementos com data-i18n
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

// Aplicar traduções quando o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}

// Exportar para uso global
window.i18n = i18n;
