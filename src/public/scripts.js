/**
 * Stream Chat Relay - Dashboard Script
 * Gerenciamento de WebSocket e Interface do Painel
 */

// Configuration
const MAX_CHAT_LENGTH = 50;

// DOM Elements
const chatContainer = document.getElementById('chat');
const statusIndicator = document.getElementById('connectionStatus');
const statusText = document.getElementById('statusText');
const messageCounter = document.getElementById('messageCount');
const analysisTotal = document.getElementById('analysisTotal');
const analysisSenders = document.getElementById('analysisSenders');
const analysisOrigins = document.getElementById('analysisOrigins');
const analysisLastMessage = document.getElementById('analysisLastMessage');
const analysisTopSender = document.getElementById('analysisTopSender');
const analysisTopOrigin = document.getElementById('analysisTopOrigin');
const analysisTopSenderFooter = document.getElementById('analysisTopSenderFooter');
const analysisTopOriginFooter = document.getElementById('analysisTopOriginFooter');
const analysisUpdatedAt = document.getElementById('analysisUpdatedAt');
const analysisStatus = document.getElementById('analysisStatus');
const analysisSendersList = document.getElementById('analysisSendersList');
const analysisOriginsList = document.getElementById('analysisOriginsList');
const settingsBtn = document.getElementById('settingsBtn');
const connectionsBtn = document.getElementById('connectionsBtn');
const clearBtn = document.getElementById('clearBtn');
const connectionsButtonBottom = document.getElementById('connectionsButtonBottom');
const configButtonBottom = document.getElementById('configButtonBottom');

// State Management
const state = {
  socket: null,
  messages: [],
  isConnected: false,
  lastPingTime: null,
  pingIntervalId: null,
  messageChart: null,
  messageCountPerInterval: 0,
  chartData: [], // Array de {time: timestamp, count: número}
  chartUpdateInterval: null,
  analysisRefreshInterval: null,
  analysisRefreshTimeout: null,
  analysisSnapshot: null
};

// DOM Elements for Ping
const pingValue = document.getElementById('pingValue');
const pingTimer = document.getElementById('pingTimer');
const pingCounter = document.getElementById('pingCounter');

// DOM Elements for Chart
const chartCanvas = document.getElementById('messageChart');
const chartInfo = document.getElementById('chartInfo');
const chartLoading = document.getElementById('chartLoading');

/**
 * Aguarda Chart.js estar disponível
 */
function waitForChart(callback, maxAttempts = 100) {
  let attempts = 0;
  
  const checkChart = () => {
    attempts++;
    
    if (typeof Chart !== 'undefined') {
      console.log('✓ Chart.js carregado com sucesso');
      callback();
    } else if (attempts < maxAttempts) {
      if (attempts % 10 === 0) {
        console.log(`Aguardando Chart.js... (${attempts}/${maxAttempts})`);
      }
      setTimeout(checkChart, 100);
    } else {
      console.error('✗ Chart.js não pôde ser carregado após ' + (maxAttempts * 100 / 1000) + ' segundos');
      console.warn('Continuando sem o gráfico...');
      
      // Mostra mensagem de erro no container do gráfico
      if (chartLoading) {
        chartLoading.innerHTML = '<span style="color: var(--warning)">⚠ Gráfico indisponível<br><small>Chart.js não carregou. Verifique a conexão.</small></span>';
      }
    }
  };
  
  checkChart();
}

/**
 * Inicializa a aplicação
 */
async function init() {
  updateConnectionStatus('connecting');

  const wsUrl = await resolveWebSocketUrl();
  setupWebSocket(wsUrl);
  setupEventListeners();
  await loadAnalysisSummary();
  startAnalysisPolling();
  
  // Aguarda Chart.js estar disponível antes de inicializar o gráfico
  waitForChart(() => {
    setupMessageChart();
  });
}

function parseSocketMessage(rawData) {
  if (typeof rawData !== 'string') {
    return rawData;
  }

  const text = rawData.trim();
  if (!text) {
    return null;
  }

  if (text === 'conectado') {
    return {
      type: 'system',
      text: 'Conectado ao relay de chat'
    };
  }

  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.type === 'chat-message' && parsed.data) {
        return {
          type: 'chat-message',
          data: parsed.data
        };
      }

      return parsed;
    } catch (_error) {
      // Trata como texto simples abaixo.
    }
  }

  return {
    type: 'chat-message',
    data: {
      content: text,
      sender: 'unknown',
      origin: 'websocket',
      type: 'text',
      timestamp: new Date().toISOString()
    }
  };
}

function normalizeMessagePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      content: String(payload ?? ''),
      sender: 'unknown',
      origin: 'unknown',
      type: 'text',
      timestamp: new Date().toISOString()
    };
  }

  return {
    content: payload.content || payload.text || payload.message || '',
    sender: payload.sender || payload.usuario || 'unknown',
    origin: payload.origin || payload.plataforma || 'unknown',
    type: payload.type || 'text',
    timestamp: payload.timestamp || new Date().toISOString(),
    id: payload.id || payload.messageId || null
  };
}

function scheduleAnalysisRefresh() {
  if (state.analysisRefreshTimeout) {
    clearTimeout(state.analysisRefreshTimeout);
  }

  state.analysisRefreshTimeout = setTimeout(() => {
    loadAnalysisSummary();
  }, 1000);
}

async function loadAnalysisSummary() {
  try {
    if (analysisStatus) {
      analysisStatus.textContent = 'Atualizando resumo...';
    }

    const response = await fetch('/api/analysis/summary', {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const summary = payload?.data || payload;
    state.analysisSnapshot = summary;
    renderAnalysisSummary(summary);
  } catch (error) {
    console.warn('Falha ao carregar análise rápida:', error);
    renderAnalysisSummary(state.analysisSnapshot);
  }
}

function startAnalysisPolling() {
  if (state.analysisRefreshInterval) {
    clearInterval(state.analysisRefreshInterval);
  }

  state.analysisRefreshInterval = setInterval(() => {
    loadAnalysisSummary();
  }, 8000);
}

function formatSummaryValue(value) {
  if (value === null || value === undefined || value === '') {
    return '--';
  }

  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR');
  }

  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderLeaderList(container, entries, emptyLabel) {
  if (!container) {
    return;
  }

  const items = Array.isArray(entries) ? entries : [];

  if (!items.length) {
    container.innerHTML = `<li class="analysis-list-empty">${emptyLabel}</li>`;
    return;
  }

  container.innerHTML = items
    .map((entry, index) => `
      <li class="analysis-list-item">
        <span class="analysis-rank">${index + 1}</span>
        <span class="analysis-name">${escapeHtml(entry.name || entry.label || 'unknown')}</span>
        <span class="analysis-count">${escapeHtml(formatSummaryValue(entry.count ?? entry.value ?? 0))}</span>
      </li>
    `)
    .join('');
}

function renderAnalysisSummary(summary) {
  const data = summary || {};
  const topSenders = Array.isArray(data.topSenders) ? data.topSenders : [];
  const topOrigins = Array.isArray(data.topOrigins) ? data.topOrigins : [];
  const uniqueSenders = Object.keys(data.bySender || {}).length;
  const uniqueOrigins = Object.keys(data.byOrigin || {}).length;

  if (analysisTotal) {
    analysisTotal.textContent = formatSummaryValue(data.totalMessages);
  }

  if (analysisSenders) {
    analysisSenders.textContent = formatSummaryValue(uniqueSenders);
  }

  if (analysisOrigins) {
    analysisOrigins.textContent = formatSummaryValue(uniqueOrigins);
  }

  if (analysisLastMessage) {
    analysisLastMessage.textContent = data.lastMessagePreview || 'Sem mensagens recentes';
  }

  if (analysisTopSender) {
    const sender = topSenders[0];
    analysisTopSender.textContent = sender ? `${sender.name} (${sender.count})` : 'Sem dados';
  }

  if (analysisTopOrigin) {
    const origin = topOrigins[0];
    analysisTopOrigin.textContent = origin ? `${origin.name} (${origin.count})` : 'Sem dados';
  }

  if (analysisTopSenderFooter) {
    const sender = topSenders[0];
    analysisTopSenderFooter.textContent = sender ? `${sender.name} (${sender.count})` : 'Sem dados';
  }

  if (analysisTopOriginFooter) {
    const origin = topOrigins[0];
    analysisTopOriginFooter.textContent = origin ? `${origin.name} (${origin.count})` : 'Sem dados';
  }

  if (analysisUpdatedAt) {
    analysisUpdatedAt.textContent = data.lastMessageAt
      ? new Date(data.lastMessageAt).toLocaleString('pt-BR')
      : '--';
  }

  if (analysisStatus) {
    analysisStatus.textContent = data.totalMessages
      ? 'Resumo ativo'
      : 'Aguardando mensagens';
  }

  renderLeaderList(analysisSendersList, topSenders, 'Nenhum remetente ainda');
  renderLeaderList(analysisOriginsList, topOrigins, 'Nenhuma origem ainda');
}

/**
 * Resolve a URL do WebSocket usando a configuração do backend.
 */
async function resolveWebSocketUrl() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const config = await response.json();
    const port = config.type_ambience === 'dev'
      ? config.dev_config?.dev_websocket_port
      : config.websocket_port;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

    if (!port) {
      throw new Error('WebSocket port not found in config');
    }

    return `${protocol}://${window.location.hostname}:${port}`;
  } catch (error) {
    console.warn('Usando porta padrão do WebSocket por falha ao ler a configuração:', error);
    return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8181`;
  }
}

/**
 * Configura WebSocket
 */
function setupWebSocket(wsUrl) {
  try {
    state.socket = new WebSocket(wsUrl);

    state.socket.onopen = () => {
      console.log('✓ Conectado ao servidor WebSocket');
      state.isConnected = true;
      updateConnectionStatus('connected');
      addSystemMessage('Conexão estabelecida com sucesso');
    };

    state.socket.onmessage = (event) => {
      const payload = parseSocketMessage(event.data);

      if (!payload) {
        return;
      }

      if (payload.type === 'system') {
        addSystemMessage(payload.text || 'Mensagem de sistema recebida');
        return;
      }

      if (payload.type === 'chat-message') {
        addMessage(payload.data);
        scheduleAnalysisRefresh();
        return;
      }

      if (payload.type === 'analysis-summary' && payload.data) {
        state.analysisSnapshot = payload.data;
        renderAnalysisSummary(payload.data);
        return;
      }

      if (typeof payload === 'string') {
        addMessage(payload);
        scheduleAnalysisRefresh();
        return;
      }

      addMessage(payload);
      scheduleAnalysisRefresh();
    };

    state.socket.onerror = (error) => {
      console.error('✗ Erro WebSocket:', error);
      updateConnectionStatus('disconnected');
      addSystemMessage(`Erro: ${error.message || 'Conexão falhou'}`);
    };

    state.socket.onclose = () => {
      console.log('✗ Conexão fechada');
      state.isConnected = false;
      updateConnectionStatus('disconnected');
      addSystemMessage('Conexão fechada. Tentando reconectar em 5s...');
      
      // Tenta reconectar depois de 5 segundos
      setTimeout(() => {
        if (!state.isConnected) {
          setupWebSocket(wsUrl);
        }
      }, 5000);
    };
  } catch (error) {
    console.error('Erro ao criar WebSocket:', error);
    updateConnectionStatus('disconnected');
  }
}

/**
 * Filtra e processa mensagem de ping
 */
function processPingMessage(text) {
  if (typeof text !== 'string') return false;
  
  // Verifica se contém "ping" (case insensitive)
  if (text.toLowerCase().includes('ping')) {
    // Atualiza o ping info
    updatePingInfo(text);
    return true; // Indica que foi processado como ping
  }
  return false;
}

/**
 * Atualiza a seção de ping info
 */
function updatePingInfo(text) {
  const now = new Date();
  
  // Atualiza o valor do ping
  pingValue.textContent = text;
  pingValue.classList.add('new');
  setTimeout(() => pingValue.classList.remove('new'), 400);
  
  // Se há um tempo anterior, calcula a diferença
  if (state.lastPingTime) {
    const diffMs = now - state.lastPingTime;
    startPingCounter(diffMs);
  }
  
  // Atualiza timestamp
  state.lastPingTime = now;
}

/**
 * Inicia um contador regressivo até o próximo ping
 */
function startPingCounter(intervalMs) {
  // Limpa o intervalo anterior se existir
  if (state.pingIntervalId) {
    clearInterval(state.pingIntervalId);
  }
  
  let elapsedMs = 0;
  const updateCounter = () => {
    elapsedMs += 100;
    const totalSeconds = Math.ceil(intervalMs / 1000);
    const remainingMs = Math.max(0, intervalMs - elapsedMs);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    if (remainingSeconds > 0) {
      pingCounter.innerHTML = `<span class="ping-time-item">Próximo ping em: <strong>${remainingSeconds}s</strong></span>`;
    }
    
    if (remainingMs <= 0) {
      clearInterval(state.pingIntervalId);
      pingCounter.innerHTML = '';
    }
  };
  
  // Atualiza imediatamente
  updateCounter();
  
  // Configura intervalo de atualização
  state.pingIntervalId = setInterval(updateCounter, 100);
}

/**
 * Função auxiliar para formatar tempo em HH:MM:SS
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Adiciona uma mensagem normal do chat
 */
function addMessage(message) {
  const normalized = normalizeMessagePayload(message);
  const content = normalized.content?.trim();

  if (!content) return;
  
  // Filtra mensagens de ping
  if (processPingMessage(content)) {
    return; // Não adiciona ao chat
  }

  // Incrementa contador para o gráfico
  state.messageCountPerInterval++;

  // Limita o número de mensagens em memória
  if (state.messages.length >= MAX_CHAT_LENGTH) {
    state.messages.shift();
    removeOldestMessageDOM();
  }

  // Adiciona ao estado
  state.messages.push({
    type: 'message',
    text: content,
    sender: normalized.sender,
    origin: normalized.origin,
    timestamp: normalized.timestamp
  });

  // Adiciona ao DOM
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-entry';
  messageElement.style.animation = 'slideInMessage 0.3s ease-out';

  const messageHeader = document.createElement('div');
  messageHeader.className = 'chat-entry-header';

  const senderBadge = document.createElement('span');
  senderBadge.className = 'chat-entry-sender';
  senderBadge.textContent = normalized.sender;

  const originBadge = document.createElement('span');
  originBadge.className = 'chat-entry-origin';
  originBadge.textContent = normalized.origin;

  const timestampBadge = document.createElement('span');
  timestampBadge.className = 'chat-entry-timestamp';
  timestampBadge.textContent = new Date(normalized.timestamp).toLocaleTimeString('pt-BR');

  const messageBody = document.createElement('p');
  messageBody.className = 'chat-entry-content';
  messageBody.textContent = content;

  messageHeader.appendChild(senderBadge);
  messageHeader.appendChild(originBadge);
  messageHeader.appendChild(timestampBadge);

  messageElement.appendChild(messageHeader);
  messageElement.appendChild(messageBody);
  
  chatContainer.appendChild(messageElement);
  
  // Scroll automático para o final
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Atualiza contador
  updateMessageCounter();
}

/**
 * Adiciona uma mensagem de sistema
 */
function addSystemMessage(text) {
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-entry system-entry';

  const messageBody = document.createElement('p');
  messageBody.className = 'system-message';
  messageBody.textContent = `[SISTEMA] ${text}`;

  messageElement.appendChild(messageBody);
  
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Remove a mensagem mais antiga do DOM
 */
function removeOldestMessageDOM() {
  const firstMessage = chatContainer.querySelector('.chat-entry');
  if (firstMessage) {
    firstMessage.style.animation = 'slideOutMessage 0.2s ease-in forwards';
    setTimeout(() => {
      firstMessage.remove();
    }, 200);
  }
}

/**
 * Atualiza o status da conexão
 */
function updateConnectionStatus(status) {
  // Remove classes anteriores
  statusIndicator.className = 'status-dot ' + status;
  
  // Atualiza texto
  switch (status) {
    case 'connected':
      statusText.textContent = 'Connected';
      statusText.style.color = 'var(--success)';
      break;
    case 'connecting':
      statusText.textContent = 'Connecting...';
      statusText.style.color = 'var(--warning)';
      break;
    case 'disconnected':
      statusText.textContent = 'Disconnected';
      statusText.style.color = 'var(--error)';
      break;
  }
}

/**
 * Atualiza o contador de mensagens
 */
function updateMessageCounter() {
  messageCounter.textContent = `Messages: ${state.messages.length}/${MAX_CHAT_LENGTH}`;
}

/**
 * Limpa o chat
 */
function clearChat() {
  if (confirm('Tem certeza que deseja limpar o chat?')) {
    chatContainer.innerHTML = '';
    state.messages = [];
    updateMessageCounter();
    addSystemMessage('Chat limpo');
    scheduleAnalysisRefresh();
  }
}

/**
 * Redireciona para a página de configurações
 */
function goToSettings() {
  window.location.href = '/config.html';
}

/**
 * Redireciona para a página de conexões
 */
function goToConnections() {
  window.location.href = '/connections.html';
}

/**
 * Atualiza o timer do ping com a hora atual
 */
function updatePingTimer() {
  const now = new Date();
  pingTimer.textContent = formatTime(now);
}

/**
 * Inicia o relógio do ping
 */
function startPingTimer() {
  updatePingTimer();
  setInterval(updatePingTimer, 1000);
}

/**
 * Configura o gráfico de mensagens
 */
function setupMessageChart() {
  if (!chartCanvas) {
    console.warn('Canvas do gráfico não encontrado');
    return;
  }

  if (typeof Chart === 'undefined') {
    console.error('Chart.js não está carregado. Tentando novamente em 500ms...');
    setTimeout(setupMessageChart, 500);
    return;
  }

  console.log('✓ Inicializando gráfico de mensagens...');

  const ctx = chartCanvas.getContext('2d');
  
  // Inicializa com 12 pontos (1 minuto / 5 segundos)
  const labels = [];
  const data = [];
  
  for (let i = 11; i >= 0; i--) {
    labels.push(`-${i * 5}s`);
    data.push(0);
  }
  
  state.chartData = data;
  
  try {
    state.messageChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mensagens',
          data: data,
          borderColor: 'rgba(34, 197, 94, 0.8)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#0a0a0a',
          pointBorderWidth: 2,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#22c55e',
            borderColor: '#404040',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Mensagens: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#a3a3a3',
              font: {
                family: 'JetBrains Mono',
                size: 10
              },
              stepSize: 1
            },
            grid: {
              color: 'rgba(64, 64, 64, 0.3)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#a3a3a3',
              font: {
                family: 'JetBrains Mono',
                size: 9
              },
              maxRotation: 0
            },
            grid: {
              color: 'rgba(64, 64, 64, 0.2)',
              drawBorder: false
            }
          }
        },
        animation: {
          duration: 300
        }
      }
    });
    
    console.log('✓ Gráfico criado com sucesso');
    
    // Remove indicador de loading
    if (chartLoading) {
      chartLoading.classList.add('hidden');
    }
    
    // Inicia o intervalo de atualização (5 segundos)
    startChartUpdates();
  } catch (error) {
    console.error('Erro ao criar gráfico:', error);
    if (chartLoading) {
      chartLoading.textContent = 'Erro ao carregar gráfico';
      chartLoading.style.color = 'var(--error)';
    }
  }
}

/**
 * Inicia atualizações periódicas do gráfico
 */
function startChartUpdates() {
  state.chartUpdateInterval = setInterval(() => {
    updateChartData();
  }, 5000); // 5 segundos
}

/**
 * Atualiza os dados do gráfico
 */
function updateChartData() {
  if (!state.messageChart) return;
  
  // Adiciona o contador atual
  state.chartData.push(state.messageCountPerInterval);
  
  // Mantém apenas os últimos 12 pontos (1 minuto)
  if (state.chartData.length > 12) {
    state.chartData.shift();
  }
  
  // Atualiza o gráfico
  state.messageChart.data.datasets[0].data = [...state.chartData];
  state.messageChart.update('none');
  
  // Atualiza info do gráfico
  if (chartInfo) {
    const total = state.chartData.reduce((sum, val) => sum + val, 0);
    chartInfo.textContent = `${total} msgs no último minuto`;
  }
  
  console.log(`Gráfico atualizado: ${state.messageCountPerInterval} mensagens neste intervalo`);
  
  // Reseta o contador
  state.messageCountPerInterval = 0;
}

/**
 * Configura listeners de eventos
 */
function setupEventListeners() {
  if (settingsBtn) {
    settingsBtn.addEventListener('click', goToSettings);
  }

  if (connectionsBtn) {
    connectionsBtn.addEventListener('click', goToConnections);
  }

  if (connectionsButtonBottom) {
    connectionsButtonBottom.addEventListener('click', goToConnections);
  }

  if (configButtonBottom) {
    configButtonBottom.addEventListener('click', goToSettings);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearChat);
  }

  // Inicia o relógio do ping
  startPingTimer();

  // Inicializa animações do Monolithic Basalt
  if (typeof MonolithicBasalt !== 'undefined' && MonolithicBasalt.init) {
    MonolithicBasalt.init();
  }
}

// Inicia a aplicação quando o DOM está pronto
document.addEventListener('DOMContentLoaded', init);

// Graceful shutdown
window.addEventListener('beforeunload', () => {
  if (state.socket && state.socket.readyState === WebSocket.OPEN) {
    state.socket.close();
  }

  if (state.pingIntervalId) {
    clearInterval(state.pingIntervalId);
  }

  if (state.chartUpdateInterval) {
    clearInterval(state.chartUpdateInterval);
  }

  if (state.analysisRefreshInterval) {
    clearInterval(state.analysisRefreshInterval);
  }

  if (state.analysisRefreshTimeout) {
    clearTimeout(state.analysisRefreshTimeout);
  }
});
