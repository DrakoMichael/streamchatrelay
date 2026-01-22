import config from "../../config.json" with { type: "json" };
import websocket_bootstrap from "../webSocket/websocket_bootstrap.js";
import quotes from "./fakeMessageData.js";
import dataControl from "../dataControl/dataControl.js";

/**
 * @module src.services.spamGenerator.liveChatSpam
 */

let loopIntervalId = null;

/**
 * Inicia o gerador de mensagens aleatórias
 * @param {string|boolean} mode - "test" para modo teste ou boolean para ativar/desativar
 * @returns {void|object} Retorna mock em modo teste
 */
export default function liveChatSpam(mode) {
  if (!config.dev_config.enable_spam) return;

  if (mode === "test") {
    return testLiveChatSpam();
  }

  const wsFunctions = websocket_bootstrap(config);
  startSpamLoop(wsFunctions);
}

/**
 * Para o gerador de spam
 */
export function stopLiveChatSpam() {
  if (loopIntervalId) {
    clearTimeout(loopIntervalId);
    loopIntervalId = null;
  }
}

/**
 * Teste do gerador de spam
 * @returns {object} Mock do wsFunctions para teste
 */
function testLiveChatSpam() {
  const messagesGenerated = [];
  const mockWsFunctions = {
    sendNewChat: (msg) => {
      messagesGenerated.push(msg);
      console.log("✓ Teste:", msg);
    }
  };

  startSpamLoop(mockWsFunctions, true, 10, 50);

  return {
    messages: messagesGenerated,
    stop: stopLiveChatSpam
  };
}

/**
 * Gera uma mensagem aleatória
 * @returns {object} Objeto com plataforma, usuario e mensagem
 */
function generateRandomMessage() {
  const indice = Math.floor(Math.random() * quotes.nome.length);

  return {
    plataforma: quotes.plataforms[Math.floor(Math.random() * quotes.plataforms.length)],
    usuario: quotes.nome[indice],
    mensagem: quotes.frases[indice]
  };
}

/**
 * Formata uma mensagem para envio
 * @param {object} messageData - Dados da mensagem
 * @returns {string} Mensagem formatada
 */
function formatMessage(messageData) {
  const { plataforma, usuario, mensagem } = messageData;
  return `[${plataforma}] ${usuario}: ${mensagem}`;
}

/**
 * Inicia o loop de envio de mensagens
 * @param {object} wsFunctions - Instância WebSocket
 * @param {boolean} isTest - Indica se é modo teste
 * @param {number} minMs - Tempo mínimo entre mensagens (ms)
 * @param {number} maxMs - Tempo máximo entre mensagens (ms)
 */
function startSpamLoop(wsFunctions, isTest = false, minMs = 0, maxMs = 500) {
  const shouldSaveToDb = !isTest && config.data_control.storage_messages_enabled;
  const shouldPrint = config.dev_config.print_spam_chats;

  function loop() {
    const messageData = generateRandomMessage();
    const formattedMessage = formatMessage(messageData);

    if (shouldPrint) {
      console.log(formattedMessage);
    }

    // if (shouldSaveToDb) {
    //   dataControl("addMessage", formattedMessage);
    // }

    wsFunctions.sendNewChat(formattedMessage);

    const nextTime = generateRandomTime(minMs, maxMs);
    loopIntervalId = setTimeout(loop, nextTime);
  }

  loop();
}

/**
 * Gera um tempo aleatório entre min e max
 * @param {number} minMs - Mínimo em milissegundos
 * @param {number} maxMs - Máximo em milissegundos
 * @returns {number} Tempo aleatório
 */
function generateRandomTime(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
