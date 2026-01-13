# Stream Chat Relay
![Stream Chat Relay Running](assets/displaygif.gif)

Uma aplicação em tempo real para retransmissão de mensagens de chat usando WebSocket e Express.js. O projeto permite que múltiplos clientes se conectem a um servidor central e compartilhem mensagens em tempo real.

## 🎯 Funcionalidades

- **Comunicação em Tempo Real**: Usando WebSocket para troca instantânea de mensagens entre clientes
- **Broadcast de Mensagens**: Todas as mensagens recebidas são retransmitidas para todos os clientes conectados
- **Modo Desenvolvimento**: Suporte a ambiente de desenvolvimento com gerador de spam de chat para testes
- **Notificações de Conexão**: Feedback visual quando clientes se conectam/desconectam
- **Interface Web**: Cliente web simples para interagir com o sistema

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para HTTP
- **WebSocket (ws)** - Protocolo para comunicação em tempo real

## 📋 Requisitos

- Node.js 14+
- npm

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/streamchatrelay.git
cd streamchatrelay
```

2. Instale as dependências:
```bash
npm install
```

## 🏃 Como Usar

### Modo Desenvolvimento

```bash
npm start
```

Será iniciado com:
- WebSocket na porta `8181`
- Express na porta `3131`
- Gerador de spam de chat ativado
- Notificações de conexão/desconexão

### Modo Produção

Configure o `config.json`:
```json
{
  "type_ambience": "prod",
  "websocket_port": 8080,
  "express_port": 3030
}
```

## 📁 Estrutura do Projeto

```
src/
├── index.js                    # Ponto de entrada da aplicação
├── config.json                 # Configurações de ambiente
├── public/
│   ├── index.html             # Interface web
│   └── scripts.js             # Script do cliente
└── services/
    ├── websocket/
    │   ├── websocket_bootstrap.js    # Inicialização do WebSocket
    │   ├── websocket_starter.js      # Startup do servidor WS
    │   └── ws_functions.js           # Lógica de manipulação de conexões
    ├── webmanager/
    │   └── express_bootstrap.js      # Inicialização do Express
    └── spamGenerator/
        └── liveChatSpam.js           # Gerador de mensagens de teste
```

## ⚙️ Configuração

O arquivo `src/config.json` controla o comportamento:

```json
{
  "type_ambience": "dev",              // "dev" ou "prod"
  "dev_config": {
    "dev_websocket_port": 8181,        // Porta WebSocket em desenvolvimento
    "dev_express_port": 3131,          // Porta Express em desenvolvimento
    "enable_spam": true,               // Ativar gerador de spam
    "connected_chat_notify": true      // Notificações de conexão
  },
  "websocket_port": 8080,              // Porta WebSocket em produção
  "express_port": 3030                 // Porta Express em produção
}
```

## 📝 Licença

ISC

## 👤 Autor

Michael
