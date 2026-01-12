import config from "../../config.json" with { type: "json" };
import websocket_bootstrap from "../webSocket/websocket_bootstrap.js";

const quotes = {
  nome: [
    "Albert Einstein",
    "Isaac Newton",
    "Marie Curie",
    "Galileu Galilei",
    "Nikola Tesla",
    "Aristóteles",
    "Platão",
    "Sócrates",
    "Charles Darwin",
    "Alan Turing",
    "Carl Sagan",
    "Stephen Hawking",
    "René Descartes",
    "Friedrich Nietzsche",
    "Immanuel Kant"
  ],
  frases: [
    "A imaginação é mais importante que o conhecimento.",
    "Se vi mais longe foi por estar sobre ombros de gigantes.",
    "Nada na vida deve ser temido, apenas compreendido.",
    "E, no entanto, ela se move.",
    "O presente é deles, mas o futuro é meu.",
    "A soma da sabedoria é a dúvida.",
    "O corpo humano é a prisão da alma.",
    "Só sei que nada sei.",
    "Não é o mais forte que sobrevive, mas o que melhor se adapta.",
    "Máquinas podem pensar?",
    "Somos poeira das estrelas.",
    "A inteligência é a capacidade de se adaptar à mudança.",
    "Penso, logo existo.",
    "Aquilo que não me mata me fortalece.",
    "O céu estrelado acima de mim e a lei moral dentro de mim."
  ]
};


export default function liveChatSpam() {
  if (!config.dev_config.enable_spam) return;

  const wsFunctions = websocket_bootstrap(config);
  iniciarChatAleatorio(quotes, wsFunctions);
}

function pegarLinhaAleatoria(quotes) {
  const indice = Math.floor(Math.random() * quotes.nome.length);

  return {
    usuario: quotes.nome[indice],
    mensagem: quotes.frases[indice]
  };
}

function iniciarChatAleatorio(quotes, wsFunctions, minMs = 0, maxMs = 500) {
  function loop() {
    const { usuario, mensagem } = pegarLinhaAleatoria(quotes);
    const msg = `${usuario}: ${mensagem}`;

    if(config.dev_config.print_spam_chats) {
      console.log(msg);
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
