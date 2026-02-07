/**
 * Stream Chat Relay - Dashboard Script
 * Gerenciamento de WebSocket e Interface do Painel
 */

// Configuration
const WS_URL = 'ws://localhost:8081';
const MAX_CHAT_LENGTH = 50;

// DOM Elements
const chatContainer = document.getElementById('chat');
const statusIndicator = document.getElementById('connectionStatus');
const statusText = document.getElementById('statusText');
const messageCounter = document.getElementById('messageCount');
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
  chartUpdateInterval: null
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
function init() {
  setupWebSocket();
  setupEventListeners();
  
  // Aguarda Chart.js estar disponível antes de inicializar o gráfico
  waitForChart(() => {
    setupMessageChart();
  });
  
  updateConnectionStatus('connecting');
}

/**
 * Configura WebSocket
 */
function setupWebSocket() {
  try {
    state.socket = new WebSocket(WS_URL);

    state.socket.onopen = () => {
      console.log('✓ Conectado ao servidor WebSocket');
      state.isConnected = true;
      updateConnectionStatus('connected');
      addSystemMessage('Conexão estabelecida com sucesso');
    };

    state.socket.onmessage = (event) => {
      addMessage(event.data);
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
          setupWebSocket();
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
function addMessage(text) {
  if (!text || typeof text !== 'string') return;
  
  // Filtra mensagens de ping
  if (processPingMessage(text)) {
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
    text: text,
    timestamp: new Date().toLocaleTimeString('pt-BR')
  });

  // Adiciona ao DOM
  const messageElement = document.createElement('p');
  messageElement.textContent = text;
  messageElement.className = 'chat-message';
  messageElement.style.animation = 'slideInMessage 0.3s ease-out';
  
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
  const messageElement = document.createElement('p');
  messageElement.textContent = `[SISTEMA] ${text}`;
  messageElement.className = 'system-message';
  messageElement.style.color = 'var(--text-dim)';
  messageElement.style.fontStyle = 'italic';
  messageElement.style.opacity = '0.8';
  
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Remove a mensagem mais antiga do DOM
 */
function removeOldestMessageDOM() {
  const firstMessage = chatContainer.querySelector('p');
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
});
