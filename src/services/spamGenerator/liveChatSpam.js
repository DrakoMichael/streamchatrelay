import websocket_bootstrap from "../websocket/websocket_bootstrap.js";
import quotes from "./fakeMessageData.js";

/**
 * @author xXx_misterious_computor_guy_xXx (i don't want to take credit for this shi)
 * @module src.services.spamGenerator.liveChatSpam
 */

let loopIntervalId = null;

export default function liveChatSpam(config, mode) {
  if (!config.dev_config.enable_spam) return;

  if (mode === "test") {
    return testLiveChatSpam();
  }

  const wsFunctions = websocket_bootstrap.getInstance();
  startSpamLoop(wsFunctions, config);
}

export function stopLiveChatSpam() {
  if (loopIntervalId) {
    clearTimeout(loopIntervalId);
    loopIntervalId = null;
  }
}

function generateRandomMessage() {
  const indice = Math.floor(Math.random() * quotes.nome.length);

  return {
    plataforma: quotes.plataforms[Math.floor(Math.random() * quotes.plataforms.length)],
    usuario: quotes.nome[indice],
    mensagem: quotes.frases[indice]
  };
}


function formatMessage(messageData) {
  const { plataforma, usuario, mensagem } = messageData;
  return `[${plataforma}] ${usuario}: ${mensagem}`;
}

function startSpamLoop(wsFunctions, config, minMs = 0, maxMs = 500) {
  const shouldPrint = config.dev_config.print_spam_chats;

  function loop() {
    const messageData = generateRandomMessage();
    const formattedMessage = formatMessage(messageData);

    if (shouldPrint) {
      console.log(formattedMessage);
    }
    
    // wsFunctions.sendNewChat(formattedMessage);

    const nextTime = generateRandomTime(minMs, maxMs);
    loopIntervalId = setTimeout(loop, nextTime);
  }

  loop();
}

function generateRandomTime(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}


function testLiveChatSpam() {
  const messagesGenerated = [];

  async function mockSendNewChat() {
    setTimeout(() => messagesGenerated.push("teste"), 100)
  }

  mockSendNewChat();
  
  return {
    messages: messagesGenerated,
    stop: stopLiveChatSpam
  };
}
