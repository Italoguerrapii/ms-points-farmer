// Content Script - Executa na página do Bing/Microsoft Rewards
// Desenvolvido por Italo Guerra

console.log('🤖 ===================================');
console.log('🤖 MICROSOFT REWARDS BOT - CONTENT SCRIPT');
console.log('🤖 URL:', window.location.href);
console.log('🤖 Timestamp:', new Date().toISOString());
console.log('🤖 ===================================');

// Notificar background que content script está pronto
try {
    chrome.runtime.sendMessage({ action: 'contentScriptReady', url: window.location.href });
    console.log('🤖 Notificação enviada ao background');
} catch (e) {
    console.log('🤖 Erro ao notificar background:', e);
}

// Configurações
const CONFIG = {
    searchDelay: { min: 3000, max: 6000 },
    clickDelay: { min: 1000, max: 2000 },
    scrollDelay: 500,
    maxRetries: 3
};

// Palavras para busca
const SEARCH_WORDS = [
    'tecnologia', 'programação', 'javascript', 'python', 'inteligência artificial',
    'machine learning', 'desenvolvimento web', 'design', 'fotografia', 'música',
    'cinema', 'história', 'geografia', 'ciência', 'física', 'química', 'biologia',
    'literatura', 'filosofia', 'matemática', 'astronomia', 'economia', 'política',
    'arte', 'culinária', 'saúde', 'fitness', 'esportes', 'futebol', 'basquete',
    'tênis', 'natação', 'yoga', 'meditação', 'psicologia', 'sociologia',
    'arquitetura', 'engenharia', 'medicina', 'direito', 'educação', 'marketing',
    'empreendedorismo', 'inovação', 'sustentabilidade', 'meio ambiente',
    'natureza', 'animais', 'plantas', 'jardinagem', 'decoração', 'moda',
    'beleza', 'turismo', 'viagens', 'gastronomia', 'vinhos', 'café', 'chá'
];

// Listener de mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('🤖 Content script recebeu mensagem:', message);
    
    switch (message.action) {
        case 'ping':
            console.log('🤖 Respondendo ao ping');
            sendResponse({ success: true, ready: true, url: window.location.href });
            break;
            
        case 'processCards':
            console.log('🤖 Iniciando processCards');
            processCards().then(result => {
                console.log('🤖 processCards concluído:', result);
                sendResponse({ success: true, result });
            }).catch(err => {
                console.error('🤖 processCards erro:', err);
                sendResponse({ success: false, error: err.message });
            });
            break;
            
        case 'performSearches':
            console.log('🤖 Iniciando performSearches:', message.type, message.count);
            performSearches(message.type, message.count).then(result => {
                console.log('🤖 performSearches concluído:', result);
                sendResponse({ success: true, result });
            }).catch(err => {
                console.error('🤖 performSearches erro:', err);
                sendResponse({ success: false, error: err.message });
            });
            break;
            
        default:
            console.log('🤖 Ação desconhecida:', message.action);
            sendResponse({ success: false, error: 'Ação desconhecida: ' + message.action });
    }
    
    return true; // Mantém canal aberto para resposta assíncrona
});

// Processar cards diários
async function processCards() {
    console.log('🤖 [CONTENT] processCards() INICIADO');
    sendLog('🎯 Processando cards diários...', 'info');
    
    let cardsProcessados = 0;
    
    try {
        // Verificar se está na página de rewards
        const currentUrl = window.location.href;
        console.log('🤖 [CONTENT] URL:', currentUrl);
        sendLog(`📍 URL: ${currentUrl.substring(0, 50)}`, 'info');
        
        if (!currentUrl.includes('rewards.bing.com') && !currentUrl.includes('rewards.microsoft.com')) {
            sendLog('📍 Navegando para rewards.bing.com', 'info');
            window.location.href = 'https://rewards.bing.com/';
            return { completed: 0 };
        }
        
        // Aguardar carregamento
        sendLog('⏳ Aguardando carregamento...', 'info');
        await sleep(3000);
        
        // Rolagens para forçar lazy-load (como no Python)
        sendLog('📜 Scroll para carregar cards...', 'info');
        for (const y of [400, 800, 1200]) {
            window.scrollTo(0, y);
            await sleep(400);
        }
        
        // Voltar ao topo
        window.scrollTo(0, 0);
        await sleep(500);
        
        // SELETOR CORRETO DO PROJETO PYTHON: a.ds-card-sec
        console.log('🤖 [CONTENT] Buscando cards...');
        sendLog('🔍 Buscando cards...', 'info');
        const cards = document.querySelectorAll('a.ds-card-sec');
        console.log('🤖 [CONTENT] Cards encontrados:', cards.length);
        sendLog(`📋 ${cards.length} cards encontrados`, 'info');
        
        // Se não encontrou com o seletor principal, tentar outros
        if (cards.length === 0) {
            sendLog('⚠️ Nenhum card encontrado!', 'info');
            
            // Verificar se a página tem o conteúdo esperado
            const dailySets = document.querySelector('#daily-sets');
            const moreActivities = document.querySelector('#more-activities');
            console.log('🤖 [CONTENT] #daily-sets:', !!dailySets, '#more-activities:', !!moreActivities);
            
            // Testar outros seletores
            const seletoresAlternativos = [
                'a[class*="ds-card"]',
                '.ds-card-sec',
                'mee-card a[href]',
                '.c-card a[href]'
            ];
            
            for (const sel of seletoresAlternativos) {
                const found = document.querySelectorAll(sel);
                if (found.length > 0) {
                    console.log(`🤖 [CONTENT] "${sel}": ${found.length} elementos`);
                }
            }
            
            return { completed: 0, found: 0, alreadyCompleted: 0 };
        }
        
        // Filtrar cards disponíveis (não completados)
        const cardsDisponiveis = [];
        const cardsIgnorar = ['indique', 'convide', 'spotify', 'instale o aplicativo', 'transforme indicações', 'transforme os amigos'];
        
        console.log('🤖 [CONTENT] Filtrando cards...');
        sendLog('🔎 Filtrando cards...', 'info');
        
        cards.forEach((card, idx) => {
            try {
                const ariaLabel = card.getAttribute('aria-label') || '';
                const ariaDisabled = card.getAttribute('aria-disabled');
                const href = card.getAttribute('href') || '';
                
                // Pular se desabilitado
                if (ariaDisabled === 'true') {
                    console.log(`🤖 [CONTENT] Card ${idx + 1} desabilitado`);
                    sendLog(`⏭️ Card ${idx + 1} desabilitado`, 'debug');
                    return;
                }
                
                // Pular se já completado (verificar ícone de check)
                const checkIcon = card.querySelector('.mee-icon-SkypeCircleCheck');
                if (checkIcon) {
                    // Verificar se o aria-label do ícone indica completado
                    const iconLabel = checkIcon.getAttribute('aria-label') || '';
                    if (iconLabel.toLowerCase().includes('ganhou') || iconLabel.toLowerCase().includes('earned')) {
                        console.log(`🤖 [CONTENT] Card ${idx + 1} já completado (check icon)`);
                        sendLog(`✅ Card ${idx + 1} já completado`, 'debug');
                        return;
                    }
                }
                
                // Pular se já completado (verificar aria-label)
                if (ariaLabel.toLowerCase().includes('points earned') || ariaLabel.toLowerCase().includes('pontos que você ganhou')) {
                    console.log(`🤖 [CONTENT] Card ${idx + 1} já completado (aria-label)`);
                    sendLog(`✅ Card ${idx + 1} já completado`, 'debug');
                    return;
                }
                
                // Pegar título
                const h3 = card.querySelector('h3');
                const titulo = h3 ? h3.textContent.trim() : `Card ${idx + 1}`;
                
                // Verificar se deve ignorar
                if (cardsIgnorar.some(ig => titulo.toLowerCase().includes(ig) || ariaLabel.toLowerCase().includes(ig))) {
                    console.log(`🤖 [CONTENT] Ignorando: "${titulo}"`);
                    sendLog(`⏭️ Ignorando: "${titulo}"`, 'debug');
                    return;
                }
                
                // Verificar se é link válido (não é # nem vazio)
                if (!href || href === '#') {
                    console.log(`🤖 [CONTENT] Card ${idx + 1} sem link válido`);
                    sendLog(`⏭️ Card ${idx + 1} sem link válido`, 'debug');
                    return;
                }
                
                console.log(`🤖 [CONTENT] Card disponível: "${titulo}"`);
                cardsDisponiveis.push({ element: card, titulo, idx, href });
                
            } catch (e) {
                console.log(`🤖 [CONTENT] Erro ao processar card ${idx}:`, e);
                // Ignorar erros individuais
            }
        });
        
        // Contar cards já completados
        const cardsCompletados = cards.length - cardsDisponiveis.length;
        
        if (cardsDisponiveis.length === 0) {
            if (cards.length > 0) {
                sendLog(`🎉 ${cards.length} cards encontrados, todos completados!`, 'success');
                console.log(`🤖 [CONTENT] Todos os ${cards.length} cards já completados`);
            } else {
                sendLog('⚠️ Nenhum card encontrado', 'info');
            }
            return { completed: 0, found: cards.length, alreadyCompleted: cardsCompletados };
        }
        
        sendLog(`📊 ${cardsDisponiveis.length} disponíveis, ${cardsCompletados} completados`, 'info');
        console.log(`🤖 [CONTENT] ${cardsDisponiveis.length} disponíveis, ${cardsCompletados} já completados`);
        
        let completed = 0;
        
        // Processar cada card
        for (const cardInfo of cardsDisponiveis) {
            const { element: card, titulo, idx } = cardInfo;
            
            try {
                sendLog(`🖱️ [${completed + 1}/${cardsDisponiveis.length}] "${titulo}"`, 'info');
                
                // Scroll até o card
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(1000);
                
                // Verificar href do card
                const href = card.getAttribute('href') || '';
                await sendLogAsync(`🔗 Link: ${href.substring(0, 60)}...`, 'debug');
                
                // Se for microsoft-edge://, não podemos processar diretamente
                if (href.includes('microsoft-edge://') || href.includes('searchbar')) {
                    await sendLogAsync(`⚠️ Card "${titulo}" tem URL microsoft-edge:// - pulando`, 'info');
                    continue;
                }
                
                // Salvar URL atual
                const urlAntes = window.location.href;
                
                // Clicar no card
                card.click();
                await sleep(4000);
                
                // Verificar se navegou para outra página
                if (window.location.href !== urlAntes) {
                    await sendLogAsync(`✅ Navegou para: ${window.location.href.substring(0, 50)}...`, 'success');
                    
                    // Aguardar página carregar
                    await sleep(3000);
                    
                    // Voltar para rewards
                    window.history.back();
                    await sleep(3000);
                }
                
                completed++;
                await sendLogAsync(`✅ Card "${titulo}" processado!`, 'success');
                
                // Fechar modais
                await closeModals();
                
            } catch (error) {
                await sendLogAsync(`⚠️ Erro ao processar "${titulo}": ${error.message}`, 'error');
            }
        }
        
        await sendLogAsync(`🎉 ${completed} cards processados com sucesso!`, 'success');
        
        // Atualizar estatísticas
        updateStats({ cardsCompleted: completed, pointsEarned: completed * 10 });
        
        return { completed, found: cards.length, alreadyCompleted: cards.length - cardsDisponiveis.length };
        
    } catch (error) {
        await sendLogAsync(`❌ Erro ao processar cards: ${error.message}`, 'error');
        console.error('Erro completo:', error);
        throw error;
    }
}

// Realizar buscas
async function performSearches(type, count) {
    sendLog(`🔍 Iniciando ${count} buscas ${type}...`, 'info');
    
    try {
        // Configurar modo mobile se necessário
        if (type === 'mobile') {
            sendLog('📱 Configurando modo mobile...', 'debug');
            await setMobileMode();
        }
        
        // Gerar lista de palavras aleatórias
        const searchTerms = generateSearchTerms(count);
        sendLog(`📝 Termos gerados: ${searchTerms.slice(0, 5).join(', ')}...`, 'debug');
        
        let completed = 0;
        
        for (let i = 0; i < count; i++) {
            try {
                const term = searchTerms[i];
                sendLog(`🔎 Busca ${i + 1}/${count}: "${term}"`, 'debug');
                
                // Ir para Bing
                window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(term)}`;
                await sleep(randomDelay(CONFIG.searchDelay.min, CONFIG.searchDelay.max));
                
                // Scroll aleatório para simular leitura
                await randomScroll();
                
                completed++;
                const percentage = Math.round((completed / count) * 100);
                sendLog(`✅ Busca ${completed}/${count} (${percentage}%) - "${term}"`, 'success');
                
                // Atualizar estatísticas
                if (type === 'desktop') {
                    updateStats({ pcSearches: completed, pointsEarned: completed * 5 });
                } else {
                    updateStats({ mobileSearches: completed, pointsEarned: completed * 5 });
                }
                
            } catch (error) {
                console.error('Erro na busca:', error);
            }
        }
        
        sendLog(`🎉 ${completed} buscas ${type} concluídas!`, 'success');
        
        // Voltar ao modo desktop
        if (type === 'mobile') {
            await setDesktopMode();
        }
        
        return { completed };
        
    } catch (error) {
        sendLog(`❌ Erro nas buscas: ${error.message}`, 'error');
        throw error;
    }
}

// Gerar termos de busca aleatórios
function generateSearchTerms(count) {
    const terms = [];
    const usedIndexes = new Set();
    
    for (let i = 0; i < count; i++) {
        let index;
        do {
            index = Math.floor(Math.random() * SEARCH_WORDS.length);
        } while (usedIndexes.has(index) && usedIndexes.size < SEARCH_WORDS.length);
        
        usedIndexes.add(index);
        
        // Às vezes adicionar número ou palavra extra
        let term = SEARCH_WORDS[index];
        if (Math.random() > 0.7) {
            term += ' ' + Math.floor(Math.random() * 1000);
        }
        
        terms.push(term);
    }
    
    return terms;
}

// Simular modo mobile
async function setMobileMode() {
    sendLog('📱 Mudando para modo Mobile...', 'info');
    // Nota: Em uma extensão real, isso seria feito pelo background script
    // alterando o user-agent da aba. Por ora, é uma simulação.
}

// Voltar ao modo desktop
async function setDesktopMode() {
    sendLog('🖥️ Voltando para modo Desktop...', 'info');
}

// Scroll aleatório
async function randomScroll() {
    const scrollAmount = Math.random() * 500 + 200;
    window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
    });
    await sleep(CONFIG.scrollDelay);
}

// Fechar modais/popups
async function closeModals() {
    const selectors = [
        '[aria-label="Close"]',
        '.close-button',
        '.modal-close',
        'button[data-bi-id*="close"]',
        '.mee-overlay-close'
    ];
    
    for (const selector of selectors) {
        const closeBtn = document.querySelector(selector);
        if (closeBtn) {
            closeBtn.click();
            await sleep(500);
        }
    }
}

// Delay aleatório
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Enviar log para background (não bloqueia execução)
function sendLog(message, logType = 'info') {
    console.log(`🤖 [${logType.toUpperCase()}] ${message}`);
    try {
        chrome.runtime.sendMessage({
            type: 'log',
            message: message,
            logType: logType
        }).catch(() => {});
    } catch (e) {
        // Contexto de extensão não disponível
    }
}

// Atualizar estatísticas
function updateStats(stats) {
    chrome.runtime.sendMessage({
        type: 'statsUpdate',
        stats: stats
    }).catch(() => {});
}

// Inicialização
console.log('🤖 Content script pronto para receber comandos');
