// Background Service Worker - Gerenciamento da automação
// Desenvolvido por Italo Guerra
// RODA EM BACKGROUND - NÃO DEPENDE DO POPUP ESTAR ABERTO!

// Estado global
let isRunning = false;
let currentSettings = null;
let automationTabId = null;
let currentProgress = 0;

// Logger simples para background
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data, sessionId: 'bg_' + Date.now() };
    
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    
    // Salvar no storage
    chrome.storage.local.get(['logs'], (result) => {
        const logs = result.logs || [];
        logs.push(logEntry);
        if (logs.length > 1000) logs.splice(0, logs.length - 1000);
        chrome.storage.local.set({ logs });
    });
    
    // Notificar popup (se estiver aberto)
    chrome.runtime.sendMessage({
        type: 'log',
        message: message,
        logType: level,
        timestamp: timestamp
    }).catch(() => {
        // Popup não está aberto, tudo bem - continua rodando
    });
}

// Instalação
chrome.runtime.onInstalled.addListener(() => {
    log('info', 'Microsoft Rewards Bot instalado!');
    
    // Configurações padrão
    chrome.storage.local.set({
        settings: {
            enablePC: true,
            enableMobile: true,
            enableCards: true,
            autoSchedule: false
        },
        stats: {
            pcSearches: 0,
            mobileSearches: 0,
            cardsCompleted: 0,
            pointsEarned: 0
        },
        logs: []
    });
});

// Listener de mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log('debug', 'Mensagem recebida', { action: message.action });
    
    switch (message.action) {
        case 'startAutomation':
            startAutomation(message.settings);
            sendResponse({ success: true });
            break;
            
        case 'stopAutomation':
            stopAutomation();
            sendResponse({ success: true });
            break;
            
        case 'getStatus':
            sendResponse({ 
                isRunning: isRunning,
                status: isRunning ? 'Executando' : 'Aguardando',
                progress: currentProgress
            });
            break;
            
        case 'scheduleDaily':
            scheduleDailyExecution();
            sendResponse({ success: true });
            break;
            
        case 'cancelSchedule':
            chrome.alarms.clear('dailyRewards');
            sendResponse({ success: true });
            break;
    }
    
    return true;
});

// Alarme para execução diária
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyRewards') {
        log('info', '⏰ Executando automação agendada');
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                startAutomation(result.settings);
            }
        });
    }
});

// Agendar execução diária às 10:00
function scheduleDailyExecution() {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(10, 0, 0, 0);
    
    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    chrome.alarms.create('dailyRewards', {
        when: scheduledTime.getTime(),
        periodInMinutes: 24 * 60
    });
    
    log('info', 'Agendamento configurado', { time: scheduledTime.toISOString() });
}

// Iniciar automação - RODA EM BACKGROUND!
async function startAutomation(settings) {
    if (isRunning) {
        log('warn', 'Automação já em execução');
        sendLogToPopup('⚠️ Automação já está em execução', 'error');
        return;
    }
    
    isRunning = true;
    currentSettings = settings;
    currentProgress = 0;
    
    log('info', '🚀 Iniciando automação', settings);
    sendLogToPopup('🚀 Iniciando automação...', 'info');
    sendStatusToPopup('Iniciando...', 'running');
    
    try {
        // Abrir Bing Rewards em nova aba
        log('debug', 'Criando nova aba...');
        const tab = await chrome.tabs.create({
            url: 'https://rewards.bing.com/',
            active: true // Deixar ativa para ver o que acontece
        });
        
        automationTabId = tab.id;
        log('success', '✅ Aba criada', { tabId: tab.id });
        sendLogToPopup('🌐 Abrindo Bing Rewards...', 'info');
        
        // Aguardar carregamento da página
        log('debug', 'Aguardando página carregar...');
        await waitForTabLoad(tab.id);
        log('debug', '✅ Página carregou');
        
        // Aguardar tempo adicional para página renderizar
        log('debug', 'Aguardando 5 segundos...');
        sendLogToPopup('⏳ Aguardando página carregar...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verificar se aba ainda existe
        try {
            await chrome.tabs.get(tab.id);
        } catch (e) {
            throw new Error('Aba foi fechada antes de iniciar');
        }
        
        // O content script é injetado automaticamente pelo manifest
        // Vamos tentar fazer ping e aguardar ele ficar pronto
        log('debug', 'Aguardando content script (injetado via manifest)...');
        sendLogToPopup('⏳ Aguardando content script...', 'info');
        
        // Tentar ping várias vezes até o content script responder
        let contentScriptReady = false;
        for (let attempt = 1; attempt <= 10; attempt++) {
            log('debug', `Tentativa ${attempt}/10 de contato com content script`);
            try {
                const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                if (pingResponse && pingResponse.ready) {
                    log('success', '✅ Content script respondeu!', pingResponse);
                    sendLogToPopup('✅ Content script pronto!', 'success');
                    contentScriptReady = true;
                    break;
                }
            } catch (pingError) {
                log('debug', `Tentativa ${attempt} falhou, aguardando...`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!contentScriptReady) {
            // Tentar injetar manualmente como fallback
            log('warn', 'Content script não respondeu, tentando injetar manualmente...');
            sendLogToPopup('⚠️ Injetando script manualmente...', 'info');
            
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['scripts/content.js']
                });
                log('debug', 'Script injetado manualmente');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Tentar ping novamente
                const retryPing = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                if (retryPing && retryPing.ready) {
                    log('success', '✅ Content script respondeu após injeção manual!');
                    sendLogToPopup('✅ Content script pronto!', 'success');
                    contentScriptReady = true;
                }
            } catch (injectError) {
                log('error', 'Falha ao injetar manualmente', injectError);
            }
        }
        
        if (!contentScriptReady) {
            throw new Error('Content script não está respondendo. Verifique se está logado no Microsoft Rewards.');
        }
        
        // Iniciar processo de automação
        log('info', 'Iniciando etapas da automação...');
        await executeAutomationSteps(tab.id, settings);
        
    } catch (error) {
        log('error', '❌ Erro na automação', { 
            message: error.message, 
            stack: error.stack 
        });
        sendLogToPopup(`❌ Erro: ${error.message}`, 'error');
        sendErrorToPopup(error.message);
        
        // Notificação de erro
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '❌ Erro na Automação',
            message: error.message
        }).catch(() => {});
        
        isRunning = false;
        currentProgress = 0;
        
        // NÃO fechar a aba em caso de erro para debug
        // stopAutomation();
    }
}

// Função segura para enviar mensagem para tab com timeout estendido
async function sendMessageToTab(tabId, message, timeoutMs = 120000) {
    log('debug', 'Enviando mensagem para tab', { tabId, action: message.action });
    
    return new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Timeout após ${timeoutMs}ms aguardando resposta`));
        }, timeoutMs);
        
        try {
            const response = await chrome.tabs.sendMessage(tabId, message);
            clearTimeout(timeoutId);
            log('debug', 'Resposta recebida', response);
            resolve(response);
        } catch (error) {
            clearTimeout(timeoutId);
            log('error', 'Erro ao enviar mensagem para tab', { 
                error: error.message,
                tabId,
                action: message.action 
            });
            reject(error);
        }
    });
}

// Executar passos da automação - CONTINUA MESMO COM POPUP FECHADO!
async function executeAutomationSteps(tabId, settings) {
    let totalSteps = 0;
    let currentStep = 0;
    
    if (settings.enableCards) totalSteps += 1;
    if (settings.enablePC) totalSteps += 1;
    if (settings.enableMobile) totalSteps += 1;
    
    if (totalSteps === 0) {
        log('warn', 'Nenhuma opção selecionada!');
        sendLogToPopup('⚠️ Nenhuma opção selecionada', 'error');
        isRunning = false;
        return;
    }
    
    log('info', `Executando ${totalSteps} etapas EM BACKGROUND`, settings);
    sendLogToPopup(`📋 ${totalSteps} etapas para executar`, 'info');
    
    try {
        // 1. Cards Diários (ainda usa content script na página de rewards)
        if (settings.enableCards) {
            currentStep++;
            sendStatusToPopup(`[${currentStep}/${totalSteps}] Processando cards diários...`, 'running');
            sendProgressToPopup(Math.round((currentStep / totalSteps) * 33));
            sendLogToPopup('🎴 Processando cards diários...', 'info');
            log('info', 'Iniciando processamento de cards');
            
            try {
                const cardResult = await sendMessageToTab(tabId, { action: 'processCards' });
                const result = cardResult?.result || {};
                const cardsCompleted = result.completed || 0;
                const cardsFound = result.found || 0;
                const alreadyCompleted = result.alreadyCompleted || 0;
                
                sendStatsUpdate({ cardsCompleted: cardsCompleted });
                
                if (cardsFound > 0 && cardsCompleted === 0) {
                    sendLogToPopup(`✅ ${cardsFound} cards encontrados, todos já completados!`, 'success');
                } else if (cardsCompleted > 0) {
                    sendLogToPopup(`✅ ${cardsCompleted} cards processados!`, 'success');
                } else {
                    sendLogToPopup(`ℹ️ Nenhum card disponível`, 'info');
                }
                
                log('info', `Cards: ${cardsFound} encontrados, ${cardsCompleted} processados, ${alreadyCompleted} já completados`);
            } catch (cardError) {
                log('error', 'Erro ao processar cards', cardError);
                sendLogToPopup('⚠️ Erro nos cards, continuando...', 'error');
            }
            
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // 2. Buscas Desktop - CONTROLADAS PELO BACKGROUND!
        if (settings.enablePC) {
            currentStep++;
            sendStatusToPopup(`[${currentStep}/${totalSteps}] Realizando buscas Desktop...`, 'running');
            sendLogToPopup('🖥️ Iniciando buscas Desktop (45)...', 'info');
            log('info', 'Iniciando buscas desktop');
            
            try {
                await performSearchesFromBackground('desktop', 45);
                sendLogToPopup('✅ Buscas Desktop concluídas!', 'success');
            } catch (searchError) {
                log('error', 'Erro nas buscas desktop', searchError);
                sendLogToPopup('⚠️ Erro nas buscas desktop', 'error');
            }
            
            sendProgressToPopup(Math.round((currentStep / totalSteps) * 66));
        }
        
        // 3. Buscas Mobile - CONTROLADAS PELO BACKGROUND!
        if (settings.enableMobile) {
            currentStep++;
            sendStatusToPopup(`[${currentStep}/${totalSteps}] Realizando buscas Mobile...`, 'running');
            sendLogToPopup('📱 Iniciando buscas Mobile (35)...', 'info');
            log('info', 'Iniciando buscas mobile');
            
            try {
                await performSearchesFromBackground('mobile', 35);
                sendLogToPopup('✅ Buscas Mobile concluídas!', 'success');
            } catch (mobileError) {
                log('error', 'Erro nas buscas mobile', mobileError);
                sendLogToPopup('⚠️ Erro nas buscas mobile', 'error');
            }
            
            sendProgressToPopup(Math.round((currentStep / totalSteps) * 90));
        }
        
        // Finalizar
        log('success', '🎉 Automação concluída!');
        sendProgressToPopup(100);
        sendCompleteToPopup();
        sendLogToPopup('🎉 Automação concluída com sucesso!', 'success');
        
        // Notificação de sucesso
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '🎉 Automação Concluída!',
            message: 'Microsoft Rewards Bot finalizou com sucesso!'
        }).catch(() => {});
        
        isRunning = false;
        currentProgress = 0;
        
    } catch (error) {
        log('error', 'Erro ao executar etapas', { 
            message: error.message,
            stack: error.stack,
            step: currentStep 
        });
        sendLogToPopup(`❌ Erro na etapa ${currentStep}: ${error.message}`, 'error');
        isRunning = false;
        throw error;
    }
}

// NOVA FUNÇÃO: Realizar buscas controladas pelo background
async function performSearchesFromBackground(type, count) {
    const searchTerms = generateElaborateSearchTerms(count);
    let completed = 0;
    
    log('info', `Iniciando ${count} buscas ${type}`, { terms: searchTerms.slice(0, 3) });
    
    // Se for mobile, ativar User-Agent mobile
    if (type === 'mobile') {
        await enableMobileUserAgent();
        sendLogToPopup('📱 Modo mobile ativado!', 'info');
    }
    
    for (let i = 0; i < count; i++) {
        if (!isRunning) {
            log('info', 'Automação interrompida pelo usuário');
            break;
        }
        
        const term = searchTerms[i];
        
        // URL diferente para mobile vs desktop
        // Mobile usa m.bing.com para forçar versão mobile
        const searchUrl = type === 'mobile' 
            ? `https://www.bing.com/search?q=${encodeURIComponent(term)}&form=QBLH&sp=-1&ghc=1&lq=0&pq=${encodeURIComponent(term.toLowerCase())}&sc=0-0&qs=n&sk=&cvid=${generateRandomCVID()}`
            : `https://www.bing.com/search?q=${encodeURIComponent(term)}`;
        
        try {
            log('debug', `Busca ${i + 1}/${count}: "${term}"`);
            sendLogToPopup(`🔎 [${i + 1}/${count}] "${term}"`, 'info');
            
            // Criar aba com a busca
            const tab = await chrome.tabs.create({
                url: searchUrl,
                active: false // Aba em background
            });
            
            // Aguardar carregamento
            await waitForTabLoad(tab.id);
            
            // DELAY HUMANO: 8-15 segundos (mais realista)
            const delay = 8000 + Math.random() * 7000;
            log('debug', `Aguardando ${Math.round(delay/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Fechar aba
            await chrome.tabs.remove(tab.id);
            
            completed++;
            
            // ATUALIZAR CONTADORES
            if (type === 'desktop') {
                sendStatsUpdate({ pcSearches: completed });
            } else {
                sendStatsUpdate({ mobileSearches: completed });
            }
            
            // Atualizar progresso a cada busca
            const percentage = Math.round((completed / count) * 100);
            sendLogToPopup(`✅ [${completed}/${count}] "${term}" (${percentage}%)`, 'success');
            
            // Pausa extra aleatória a cada 5 buscas (simula distração humana)
            if (completed % 5 === 0 && completed < count) {
                const extraPause = 3000 + Math.random() * 5000;
                log('debug', `Pausa extra de ${Math.round(extraPause/1000)}s`);
                sendLogToPopup(`⏸️ Pausinha de ${Math.round(extraPause/1000)}s...`, 'info');
                await new Promise(resolve => setTimeout(resolve, extraPause));
            }
            
        } catch (error) {
            log('error', `Erro na busca ${i + 1}`, { term, error: error.message });
        }
    }
    
    // Desativar User-Agent mobile após terminar
    if (type === 'mobile') {
        await disableMobileUserAgent();
        sendLogToPopup('🖥️ Modo desktop restaurado!', 'info');
    }
    
    log('success', `${completed}/${count} buscas ${type} concluídas`);
    return { completed };
}

// User-Agent de iPhone para simular mobile
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// IDs das regras para modificar headers
const MOBILE_UA_RULE_ID = 1;
const MOBILE_SEC_CH_RULE_ID = 2;
const MOBILE_SEC_CH_MOBILE_RULE_ID = 3;
const MOBILE_SEC_CH_PLATFORM_RULE_ID = 4;

// Gerar CVID aleatório (usado pelo Bing)
function generateRandomCVID() {
    const chars = 'ABCDEF0123456789';
    let cvid = '';
    for (let i = 0; i < 32; i++) {
        cvid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return cvid;
}

// Ativar User-Agent mobile com todos os headers necessários
async function enableMobileUserAgent() {
    log('debug', 'Ativando modo mobile completo...');
    
    try {
        // Remover regras existentes
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [MOBILE_UA_RULE_ID, MOBILE_SEC_CH_RULE_ID, MOBILE_SEC_CH_MOBILE_RULE_ID, MOBILE_SEC_CH_PLATFORM_RULE_ID]
        });
        
        // Adicionar todas as regras para simular mobile
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [
                // User-Agent principal
                {
                    id: MOBILE_UA_RULE_ID,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [{
                            header: 'User-Agent',
                            operation: 'set',
                            value: MOBILE_USER_AGENT
                        }]
                    },
                    condition: {
                        urlFilter: '*://*.bing.com/*',
                        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet']
                    }
                },
                // Sec-CH-UA (indica browser mobile)
                {
                    id: MOBILE_SEC_CH_RULE_ID,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [{
                            header: 'Sec-CH-UA',
                            operation: 'set',
                            value: '"Safari";v="17", "Mobile Safari";v="17"'
                        }]
                    },
                    condition: {
                        urlFilter: '*://*.bing.com/*',
                        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest']
                    }
                },
                // Sec-CH-UA-Mobile (indica que é mobile)
                {
                    id: MOBILE_SEC_CH_MOBILE_RULE_ID,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [{
                            header: 'Sec-CH-UA-Mobile',
                            operation: 'set',
                            value: '?1'
                        }]
                    },
                    condition: {
                        urlFilter: '*://*.bing.com/*',
                        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest']
                    }
                },
                // Sec-CH-UA-Platform (indica iOS)
                {
                    id: MOBILE_SEC_CH_PLATFORM_RULE_ID,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [{
                            header: 'Sec-CH-UA-Platform',
                            operation: 'set',
                            value: '"iOS"'
                        }]
                    },
                    condition: {
                        urlFilter: '*://*.bing.com/*',
                        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest']
                    }
                }
            ]
        });
        
        log('success', 'Modo mobile ativado! (User-Agent + Sec-CH headers)');
    } catch (error) {
        log('error', 'Erro ao ativar modo mobile', error);
    }
}

// Desativar modo mobile (voltar ao normal)
async function disableMobileUserAgent() {
    log('debug', 'Desativando modo mobile...');
    
    try {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [MOBILE_UA_RULE_ID, MOBILE_SEC_CH_RULE_ID, MOBILE_SEC_CH_MOBILE_RULE_ID, MOBILE_SEC_CH_PLATFORM_RULE_ID]
        });
        log('success', 'Modo mobile desativado!');
    } catch (error) {
        log('error', 'Erro ao desativar modo mobile', error);
    }
}

// Enviar atualização de estatísticas para o popup
function sendStatsUpdate(stats) {
    chrome.runtime.sendMessage({
        type: 'statsUpdate',
        stats: stats
    }).catch(() => {});
}

// SISTEMA DE GERAÇÃO DE FRASES ELABORADAS (500mil+ combinações)
function generateElaborateSearchTerms(count) {
    // Templates de frases (cada [] será substituído)
    const templates = [
        "Melhores [SUBSTANTIVO] para [ACAO] em [ANO]",
        "Como [ACAO] [SUBSTANTIVO] de forma [ADJETIVO]",
        "Top 10 [SUBSTANTIVO] mais [ADJETIVO] do [LUGAR]",
        "Guia completo de [SUBSTANTIVO] para [PESSOA]",
        "Dicas de [SUBSTANTIVO] para [ACAO] melhor",
        "O que é [SUBSTANTIVO] e como [ACAO]",
        "Por que [SUBSTANTIVO] é [ADJETIVO] para [PESSOA]",
        "[SUBSTANTIVO] vs [SUBSTANTIVO2]: qual é [ADJETIVO]",
        "Como escolher [SUBSTANTIVO] [ADJETIVO] em [ANO]",
        "Tudo sobre [SUBSTANTIVO] que você precisa saber",
        "Ranking de [SUBSTANTIVO] mais [ADJETIVO]",
        "[NUMERO] maneiras de [ACAO] [SUBSTANTIVO]",
        "Onde encontrar [SUBSTANTIVO] [ADJETIVO]",
        "História de [SUBSTANTIVO] no [LUGAR]",
        "Benefícios de [SUBSTANTIVO] para [PESSOA]",
        "Comparativo de [SUBSTANTIVO] [ADJETIVO]",
        "[SUBSTANTIVO] [ADJETIVO] para [ACAO]",
        "Novidades sobre [SUBSTANTIVO] em [ANO]",
        "Melhores práticas de [SUBSTANTIVO]",
        "Tutorial de [SUBSTANTIVO] para iniciantes",
        "Como funciona [SUBSTANTIVO]",
        "[PESSOA] que [ACAO] [SUBSTANTIVO]",
        "Preço de [SUBSTANTIVO] em [ANO]",
        "Review de [SUBSTANTIVO] [ADJETIVO]",
        "Vale a pena [ACAO] [SUBSTANTIVO]"
    ];
    
    const substantivos = [
        'times', 'jogos', 'celulares', 'notebooks', 'carros', 'motos', 'bicicletas',
        'restaurantes', 'hotéis', 'praias', 'montanhas', 'cidades', 'países',
        'filmes', 'séries', 'livros', 'músicas', 'bandas', 'artistas', 'cantores',
        'receitas', 'comidas', 'bebidas', 'vinhos', 'cervejas', 'cafés', 'chás',
        'exercícios', 'treinos', 'dietas', 'suplementos', 'vitaminas', 'remédios',
        'roupas', 'sapatos', 'relógios', 'óculos', 'bolsas', 'acessórios',
        'aplicativos', 'programas', 'sites', 'ferramentas', 'extensões', 'plugins',
        'cursos', 'faculdades', 'escolas', 'certificações', 'concursos', 'provas',
        'investimentos', 'ações', 'criptomoedas', 'fundos', 'poupança', 'empréstimos',
        'plantas', 'flores', 'árvores', 'jardins', 'hortas', 'vasos',
        'pets', 'cachorros', 'gatos', 'pássaros', 'peixes', 'hamsters',
        'móveis', 'decorações', 'quadros', 'luminárias', 'cortinas', 'tapetes',
        'câmeras', 'drones', 'fones', 'caixas de som', 'smartwatches', 'tablets',
        'brasfoot', 'football manager', 'fifa', 'pes', 'minecraft', 'fortnite',
        'técnicas', 'estratégias', 'métodos', 'sistemas', 'processos', 'frameworks'
    ];
    
    const substantivos2 = [
        'alternativas', 'concorrentes', 'similares', 'opções', 'substitutos',
        'versões', 'modelos', 'marcas', 'tipos', 'categorias'
    ];
    
    const acoes = [
        'jogar', 'usar', 'comprar', 'vender', 'alugar', 'fazer', 'criar',
        'aprender', 'ensinar', 'treinar', 'praticar', 'melhorar', 'otimizar',
        'instalar', 'configurar', 'personalizar', 'baixar', 'atualizar',
        'cozinhar', 'preparar', 'servir', 'decorar', 'organizar', 'limpar',
        'investir', 'economizar', 'ganhar', 'lucrar', 'negociar',
        'viajar', 'visitar', 'conhecer', 'explorar', 'fotografar',
        'assistir', 'ouvir', 'ler', 'estudar', 'pesquisar', 'analisar',
        'começar', 'iniciar', 'dominar', 'evoluir', 'progredir'
    ];
    
    const adjetivos = [
        'melhor', 'pior', 'mais barato', 'mais caro', 'mais rápido', 'mais lento',
        'mais fácil', 'mais difícil', 'mais popular', 'mais famoso', 'mais usado',
        'mais vendido', 'mais recomendado', 'mais eficiente', 'mais bonito',
        'gratuito', 'premium', 'profissional', 'iniciante', 'avançado',
        'moderno', 'clássico', 'tradicional', 'inovador', 'revolucionário',
        'brasileiro', 'americano', 'europeu', 'asiático', 'mundial',
        'online', 'offline', 'híbrido', 'remoto', 'presencial',
        'saudável', 'natural', 'orgânico', 'sustentável', 'ecológico'
    ];
    
    const lugares = [
        'Brasil', 'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia',
        'mundo', 'internet', 'mercado', 'região', 'país',
        'América Latina', 'Europa', 'Estados Unidos', 'Ásia', 'África'
    ];
    
    const pessoas = [
        'iniciantes', 'profissionais', 'estudantes', 'empresários', 'freelancers',
        'gamers', 'desenvolvedores', 'designers', 'músicos', 'atletas',
        'crianças', 'adolescentes', 'adultos', 'idosos', 'famílias',
        'homens', 'mulheres', 'casais', 'solteiros', 'aposentados'
    ];
    
    const anos = ['2024', '2025', '2026', 'hoje', 'atualmente', 'esse ano'];
    const numeros = ['5', '7', '10', '15', '20', '25', '30', '50', '100'];
    
    // Função para pegar item aleatório
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Gerar frases únicas
    const terms = new Set();
    let attempts = 0;
    const maxAttempts = count * 10;
    
    while (terms.size < count && attempts < maxAttempts) {
        attempts++;
        
        let phrase = random(templates)
            .replace('[SUBSTANTIVO]', random(substantivos))
            .replace('[SUBSTANTIVO2]', random(substantivos2))
            .replace('[ACAO]', random(acoes))
            .replace('[ADJETIVO]', random(adjetivos))
            .replace('[LUGAR]', random(lugares))
            .replace('[PESSOA]', random(pessoas))
            .replace('[ANO]', random(anos))
            .replace('[NUMERO]', random(numeros));
        
        // Adicionar variação extra aleatória
        if (Math.random() > 0.7) {
            phrase += ' ' + random(['grátis', 'passo a passo', 'completo', 'atualizado', 'funciona']);
        }
        
        terms.add(phrase);
    }
    
    return Array.from(terms);
}

// Combinações possíveis: 25 templates × 85 substantivos × 10 substantivos2 × 43 ações × 38 adjetivos × 15 lugares × 20 pessoas × 6 anos × 9 números
// = 25 × 85 × 43 × 38 × 15 × 20 × 6 = ~2.9 BILHÕES de combinações!

// Parar automação
function stopAutomation() {
    isRunning = false;
    currentProgress = 0;
    
    if (automationTabId) {
        chrome.tabs.remove(automationTabId).catch(() => {});
        automationTabId = null;
    }
    
    log('info', '⏹️ Automação interrompida');
    sendLogToPopup('⏹️ Automação interrompida', 'info');
}

// Aguardar carregamento da aba
function waitForTabLoad(tabId) {
    return new Promise((resolve) => {
        const listener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tabId && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
        
        // Timeout de segurança de 30 segundos
        setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
        }, 30000);
    });
}

// Funções de comunicação com popup (NÃO BLOQUEIAM SE POPUP FECHADO!)
function sendLogToPopup(message, logType = 'info') {
    chrome.runtime.sendMessage({
        type: 'log',
        message: message,
        logType: logType
    }).catch(() => {});
}

function sendStatusToPopup(status, statusType = 'running') {
    chrome.runtime.sendMessage({
        type: 'status',
        status: status,
        statusType: statusType
    }).catch(() => {});
}

function sendProgressToPopup(percent) {
    currentProgress = percent;
    chrome.runtime.sendMessage({
        type: 'progress',
        percent: percent
    }).catch(() => {});
}

function sendCompleteToPopup() {
    chrome.runtime.sendMessage({
        type: 'complete'
    }).catch(() => {});
}

function sendErrorToPopup(error) {
    chrome.runtime.sendMessage({
        type: 'error',
        error: error
    }).catch(() => {});
}

function updateStatsInPopup(stats) {
    chrome.runtime.sendMessage({
        type: 'stats',
        stats: stats
    }).catch(() => {});
}

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'statsUpdate') {
        chrome.storage.local.get(['stats'], (result) => {
            const currentStats = result.stats || {};
            const updatedStats = { ...currentStats, ...message.stats };
            chrome.storage.local.set({ stats: updatedStats });
            updateStatsInPopup(updatedStats);
        });
    }
    
    if (message.type === 'log') {
        sendLogToPopup(message.message, message.logType);
        log(message.logType || 'info', message.message, message.data);
    }
});

// Manter service worker ativo
setInterval(() => {
    log('debug', 'Service worker ativo');
}, 20000); // Ping a cada 20 segundos
