// Popup Script - Interface do usuário
// Desenvolvido por Italo Guerra

console.log('🚀 POPUP.JS CARREGADO!');

// Elementos DOM
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnDesktop = document.getElementById('btnDesktop');
const btnMobile = document.getElementById('btnMobile');
const btnCards = document.getElementById('btnCards');
const statusCard = document.getElementById('statusCard');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const logContainer = document.getElementById('logContainer');
const statPC = document.getElementById('statPC');
const statMobile = document.getElementById('statMobile');
const statCards = document.getElementById('statCards');
const statPoints = document.getElementById('statPoints');

// Opções
const optPC = document.getElementById('optPC');
const optMobile = document.getElementById('optMobile');
const optCards = document.getElementById('optCards');
const optSchedule = document.getElementById('optSchedule');

// Estado
let isRunning = false;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOMContentLoaded');
    
    loadSettings();
    loadStats();
    loadLogs();
    setupEventListeners();
    checkRunningStatus();
    
    console.log('✅ Popup inicializado');
});

// Event Listeners
function setupEventListeners() {
    console.log('📋 Configurando listeners...');
    
    btnStart.addEventListener('click', () => {
        console.log('🎯 CLICK START!');
        startAutomation();
    });
    
    btnStop.addEventListener('click', () => {
        console.log('🛑 CLICK STOP!');
        stopAutomation();
    });
    
    // Botão só Desktop
    btnDesktop.addEventListener('click', () => {
        console.log('🖥️ CLICK DESKTOP!');
        startAutomation('desktop');
    });
    
    // Botão só Mobile
    btnMobile.addEventListener('click', () => {
        console.log('📱 CLICK MOBILE!');
        startAutomation('mobile');
    });
    
    // Botão só Cards
    btnCards.addEventListener('click', () => {
        console.log('🎯 CLICK CARDS!');
        startAutomation('cards');
    });
    
    // Salvar opções quando mudarem
    [optPC, optMobile, optCards, optSchedule].forEach(opt => {
        if (opt) opt.addEventListener('change', saveSettings);
    });
    
    console.log('✅ Listeners OK');
}

// Carregar configurações salvas
function loadSettings() {
    chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
            optPC.checked = result.settings.enablePC !== false;
            optMobile.checked = result.settings.enableMobile !== false;
            optCards.checked = result.settings.enableCards !== false;
            optSchedule.checked = result.settings.autoSchedule || false;
        }
    });
}

// Salvar configurações
function saveSettings() {
    const settings = {
        enablePC: optPC.checked,
        enableMobile: optMobile.checked,
        enableCards: optCards.checked,
        autoSchedule: optSchedule.checked
    };
    
    chrome.storage.local.set({ settings }, () => {
        addLog('⚙️ Configurações salvas', 'info');
        
        if (settings.autoSchedule) {
            chrome.runtime.sendMessage({ action: 'scheduleDaily' });
        } else {
            chrome.runtime.sendMessage({ action: 'cancelSchedule' });
        }
    });
}

// Carregar estatísticas
function loadStats() {
    chrome.storage.local.get(['stats'], (result) => {
        if (result.stats) {
            updateStats(result.stats);
        }
    });
}

// Carregar logs anteriores
function loadLogs() {
    chrome.storage.local.get(['logs'], (result) => {
        if (result.logs && result.logs.length > 0) {
            logContainer.innerHTML = '';
            const recentLogs = result.logs.slice(-10).reverse();
            recentLogs.forEach(log => {
                const timestamp = new Date(log.timestamp).toLocaleTimeString('pt-BR');
                addLogEntry(`[${timestamp}] ${log.message}`, log.level);
            });
        }
    });
}

// Atualizar estatísticas na UI
function updateStats(stats) {
    statPC.textContent = `${stats.pcSearches || 0}/45`;
    statMobile.textContent = `${stats.mobileSearches || 0}/35`;
    statCards.textContent = `${stats.cardsCompleted || 0}`;
    statPoints.textContent = `${stats.pointsEarned || 0}`;
}

// Verificar se automação está rodando
function checkRunningStatus() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response && response.isRunning) {
            setRunningState(true);
            updateStatus(response.status || 'Executando...', 'running');
            updateProgress(response.progress || 0);
        }
    });
}

// ========================
// INICIAR AUTOMAÇÃO
// ========================
async function startAutomation(mode = null) {
    console.log('🚀 startAutomation()', mode);
    
    if (isRunning) {
        console.log('Já rodando, ignorando');
        return;
    }
    
    let settings;
    
    // Se passou um modo específico (desktop ou mobile), usa só ele
    if (mode === 'desktop') {
        settings = {
            enablePC: true,
            enableMobile: false,
            enableCards: false
        };
        addLog('🖥️ Modo: Apenas Desktop (45 buscas)', 'info');
    } else if (mode === 'mobile') {
        settings = {
            enablePC: false,
            enableMobile: true,
            enableCards: false
        };
        addLog('📱 Modo: Apenas Mobile (35 buscas)', 'info');
    } else if (mode === 'cards') {
        settings = {
            enablePC: false,
            enableMobile: false,
            enableCards: true
        };
        addLog('🎯 Modo: Apenas Cards Diários', 'info');
    } else {
        // Modo completo - usa as opções marcadas
        settings = {
            enablePC: optPC.checked,
            enableMobile: optMobile.checked,
            enableCards: optCards.checked
        };
    }
    
    console.log('Settings:', settings);
    
    // Verificar se pelo menos uma opção está marcada
    if (!settings.enablePC && !settings.enableMobile && !settings.enableCards) {
        addLog('⚠️ Selecione pelo menos uma opção!', 'error');
        return;
    }
    
    setRunningState(true);
    updateStatus('Iniciando automação...', 'running');
    addLog('🚀 Iniciando automação...', 'info');
    
    // Resetar estatísticas
    chrome.storage.local.set({ 
        stats: { pcSearches: 0, mobileSearches: 0, cardsCompleted: 0, pointsEarned: 0 }
    });
    updateStats({ pcSearches: 0, mobileSearches: 0, cardsCompleted: 0, pointsEarned: 0 });
    
    console.log('📤 Enviando para background...');
    
    // Enviar comando para background
    try {
        chrome.runtime.sendMessage({ 
            action: 'startAutomation',
            settings: settings
        }, (response) => {
            console.log('📥 Resposta:', response);
            if (response && response.success) {
                addLog('✅ Comando enviado!', 'success');
            } else {
                addLog('❌ Erro ao enviar', 'error');
                setRunningState(false);
            }
        });
    } catch (error) {
        console.error('Erro:', error);
        addLog('❌ Erro: ' + error.message, 'error');
        setRunningState(false);
    }
}

// Parar automação
function stopAutomation() {
    chrome.runtime.sendMessage({ action: 'stopAutomation' }, (response) => {
        setRunningState(false);
        updateStatus('Automação interrompida', 'error');
        addLog('⏹️ Automação interrompida', 'info');
    });
}

// Atualizar status visual
function updateStatus(text, type = 'idle') {
    statusText.textContent = text;
    statusCard.className = 'status-card ' + type;
}

// Atualizar progresso
function updateProgress(percent) {
    if (percent > 0) {
        progressBar.style.display = 'block';
        progressFill.style.width = percent + '%';
    } else {
        progressBar.style.display = 'none';
    }
}

// Adicionar log
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    addLogEntry(`[${timestamp}] ${message}`, type);
}

// Adicionar entrada no log (DOM)
function addLogEntry(text, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = text;
    
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Limitar a 50 entradas
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// Definir estado de execução
function setRunningState(running) {
    isRunning = running;
    btnStart.style.display = running ? 'none' : 'flex';
    btnStop.style.display = running ? 'flex' : 'none';
    btnStart.disabled = running;
    
    // Desabilitar botões separados durante execução
    btnDesktop.disabled = running;
    btnMobile.disabled = running;
    btnCards.disabled = running;
    
    // Desabilitar opções durante execução
    [optPC, optMobile, optCards].forEach(opt => {
        if (opt) opt.disabled = running;
    });
}

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Mensagem recebida:', message);
    
    if (message.type === 'log') {
        const timestamp = message.timestamp ? 
            new Date(message.timestamp).toLocaleTimeString('pt-BR') : 
            new Date().toLocaleTimeString('pt-BR');
        addLogEntry(`[${timestamp}] ${message.message}`, message.logType || 'info');
    }
    
    if (message.type === 'status') {
        updateStatus(message.status, message.statusType || 'running');
    }
    
    if (message.type === 'progress') {
        updateProgress(message.percent);
    }
    
    if (message.type === 'stats' || message.type === 'statsUpdate') {
        // Carregar stats existentes e atualizar
        chrome.storage.local.get(['stats'], (result) => {
            const currentStats = result.stats || { pcSearches: 0, mobileSearches: 0, cardsCompleted: 0, pointsEarned: 0 };
            const newStats = { ...currentStats, ...message.stats };
            
            // Calcular pontos (3 por busca PC, 3 por busca mobile)
            newStats.pointsEarned = (newStats.pcSearches * 3) + (newStats.mobileSearches * 3) + (newStats.cardsCompleted * 10);
            
            // Salvar e atualizar UI
            chrome.storage.local.set({ stats: newStats });
            updateStats(newStats);
        });
    }
    
    if (message.type === 'complete') {
        setRunningState(false);
        updateStatus('Automação concluída!', 'success');
        updateProgress(100);
        addLog('🎉 Automação concluída!', 'success');
        loadStats();
    }
    
    if (message.type === 'error') {
        setRunningState(false);
        updateStatus('Erro na automação', 'error');
        addLog(`❌ ${message.error}`, 'error');
    }
});

console.log('✅ POPUP.JS PRONTO!');
