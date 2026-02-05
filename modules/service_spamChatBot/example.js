/**
 * Exemplo de uso do LiveChatSpam
 */

import LiveChatSpam from './liveChatSpam.js';

// ============================================================================
// EXEMPLO 1: Uso básico
// ============================================================================

const spamGenerator = new LiveChatSpam({
  enabled: true,
  shouldPrint: true,
  minDelay: 1000,
  maxDelay: 3000,
  wsUrl: 'ws://localhost:8080'
});

spamGenerator.start();

// Para depois de 10 segundos
setTimeout(() => {
  spamGenerator.stop();
}, 10000);

// ============================================================================
// EXEMPLO 2: Com controle de pausa/resume
// ============================================================================

const spamWithPause = new LiveChatSpam({
  enabled: true,
  shouldPrint: true,
  minDelay: 500,
  maxDelay: 2000,
  wsUrl: 'ws://localhost:8080'
});

spamWithPause.start();

// Pausa após 5 segundos
setTimeout(() => {
  spamWithPause.pause();
  console.log('Pausado!');
}, 5000);

// Resume após 8 segundos
setTimeout(() => {
  spamWithPause.resume();
  console.log('Retomado!');
}, 8000);

// Para definitivamente após 15 segundos
setTimeout(() => {
  spamWithPause.stop();
}, 15000);

// ============================================================================
// EXEMPLO 3: Compatibilidade com formato antigo de config
// ============================================================================

const oldFormatConfig = {
  dev_config: {
    enable_spam: true,
    print_spam_chats: true,
    spam_min_delay: 1000,
    spam_max_delay: 4000,
    ws_url: 'ws://localhost:8080'
  }
};

const spamOldFormat = new LiveChatSpam(oldFormatConfig);
spamOldFormat.start();

// ============================================================================
// EXEMPLO 4: Monitoramento de estatísticas
// ============================================================================

const spamWithStats = new LiveChatSpam({
  enabled: true,
  shouldPrint: false,
  minDelay: 200,
  maxDelay: 500,
  wsUrl: 'ws://localhost:8080'
});

spamWithStats.start();

// Verifica estatísticas a cada 2 segundos
const statsInterval = setInterval(() => {
  const stats = spamWithStats.getStats();
  console.log('📊 Stats:', {
    generated: stats.messagesGenerated,
    sent: stats.messagesSent,
    failed: stats.messagesFailed,
    rate: stats.messagesPerSecond + ' msg/s',
    connected: stats.isConnected
  });
}, 2000);

// Para após 12 segundos e limpa o intervalo
setTimeout(() => {
  clearInterval(statsInterval);
  spamWithStats.stop();
}, 12000);

// ============================================================================
// EXEMPLO 5: Atualização de configuração em tempo real
// ============================================================================

const dynamicSpam = new LiveChatSpam({
  enabled: true,
  shouldPrint: true,
  minDelay: 2000,
  maxDelay: 4000,
  wsUrl: 'ws://localhost:8080'
});

dynamicSpam.start();

// Após 5 segundos, aumenta a velocidade
setTimeout(() => {
  console.log('⚡ Aumentando velocidade...');
  dynamicSpam.updateConfig({
    minDelay: 500,
    maxDelay: 1000
  });
}, 5000);

// Após 10 segundos, diminui a velocidade
setTimeout(() => {
  console.log('🐌 Diminuindo velocidade...');
  dynamicSpam.updateConfig({
    minDelay: 3000,
    maxDelay: 6000
  });
}, 10000);

// Para após 15 segundos
setTimeout(() => {
  dynamicSpam.stop();
}, 15000);

// ============================================================================
// EXEMPLO 6: Uso com função helper (compatibilidade total)
// ============================================================================

const { createSpamGenerator, stopLiveChatSpam } = require('./liveChatSpam');

const generator = createSpamGenerator({
  enabled: true,
  shouldPrint: true,
  minDelay: 1000,
  maxDelay: 2000
});

setTimeout(() => {
  stopLiveChatSpam(generator);
}, 8000);
