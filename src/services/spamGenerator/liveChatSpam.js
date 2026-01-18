import config from "../../config.json" with { type: "json" };
import websocket_bootstrap from "../webSocket/websocket_bootstrap.js";
import quotes from "./fakeMessageData.js";
import dataControl from "../dataControl/dataControl.js";

/**
 * @module src.services.spamGenerator.liveChatSpam
 */

export default function liveChatSpam() {
  if (!config.dev_config.enable_spam) return;

  const wsFunctions = websocket_bootstrap(config);
  iniciarChatAleatorio(quotes, wsFunctions);
}

function pegarLinhaAleatoria(quotes) {
  const indice = Math.floor(Math.random() * quotes.nome.length);

  return {
    plataforma: quotes.plataforms[Math.floor(Math.random() * quotes.plataforms.length)],
    usuario: quotes.nome[indice],
    mensagem: quotes.frases[indice]
  };
}

function iniciarChatAleatorio(quotes, wsFunctions, minMs = 0, maxMs = 500) {
  function loop() {
    const { plataforma, usuario, mensagem } = pegarLinhaAleatoria(quotes);
    const msg = `[${plataforma}] ${usuario}: ${mensagem}`;

    if(config.dev_config.print_spam_chats) {
      console.log(msg);
    }
    if(config.data_control.storage_messages_enabled) {
      dataControl('addMessage', msg);
    }

    wsFunctions.sendNewChat(msg);

    const proximoTempo = tempoAleatorio(minMs, maxMs);
    setTimeout(loop, proximoTempo);
  }

  loop();
}

function tempoAleatorio(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
