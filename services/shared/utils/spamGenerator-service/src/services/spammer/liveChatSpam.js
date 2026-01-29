import quotes from "./fakeMessageData.js";

let loopIntervalId = null;

export default function liveChatSpam(config) {
  if (!config.dev_config.enable_spam) {
    console.log("[SPAM] Spam generator is disabled in config");
    return;
  }

  const wsFunctions = websocket_bootstrap.getInstance();
  if (!wsFunctions) {
    console.error("[SPAM] ✗ WebSocket instance not found! Cannot start spam generator.");
    return;
  }

  console.log("[SPAM] ✓ WebSocket instance found, starting spam generator");

  const shouldPrint = config.dev_config.print_spam_chats;
  const minMs = config.dev_config.spam_min_delay || 0;
  const maxMs = config.dev_config.spam_max_delay || 500;

  function loop() {
    const indice = Math.floor(Math.random() * quotes.nome.length);
    const message = {
      plataforma: quotes.plataforms[Math.floor(Math.random() * quotes.plataforms.length)],
      usuario: quotes.nome[indice],
      mensagem: quotes.frases[indice]
    };

    if (shouldPrint) {
      console.log(`[${message.plataforma}] ${message.usuario}: ${message.mensagem}`);
    }

    // Broadcast via WebSocket
    wsFunctions.broadcast(JSON.stringify(message));

    const nextTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    loopIntervalId = setTimeout(loop, nextTime);
  }

  loop();
}

export function stopLiveChatSpam() {
  if (loopIntervalId) {
    clearTimeout(loopIntervalId);
    loopIntervalId = null;
  }
}
