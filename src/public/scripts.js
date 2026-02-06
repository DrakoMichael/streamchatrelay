const socket = new WebSocket('ws://localhost:8081');
let chat = [];
const chatHtml = document.getElementById("chat");
const maxChatLength = 10;

socket.onopen = () => {
//   console.log('Conectado ao servidor');
//   socket.send('Olá, servidor!');
};

socket.onmessage = (event) => {
  insertMessage(event.data);
  addOnPage(event.data);
};

socket.onclose = () => {
  console.log('Conexão fechada');
};

function insertMessage(mensagem) {
  if (chat.length >= maxChatLength) {
    chat.shift();              // estado
    removeOldestFromPage();    // visão
  }

  chat.push(mensagem);
}

function removeOldestFromPage() {
  if (chatHtml.firstChild) {
    chatHtml.removeChild(chatHtml.firstChild);
  }
}

function addOnPage(text) {
  const temp = document.createElement("p");
  temp.textContent = text; // descobri q é mais seguro que innerHTML
  chatHtml.appendChild(temp);
}
