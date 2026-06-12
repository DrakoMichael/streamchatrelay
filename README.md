![](docs/displaygif.gif)

# Stream Chat Relay

Uma aplicação em tempo real para centralizar, retransmitir e analisar mensagens de chat e eventos de lives. O projeto combina WebSocket, Express, SQLite e um painel web para acompanhar o fluxo de mensagens, métricas rápidas e o comportamento do ambiente em desenvolvimento.

## Visão Geral

O fluxo principal da aplicação hoje é:

`src/index.js` -> `src/services/settings/loadsettings.js` -> `src/services/app/bootstrapApp.js`

Esse bootstrap inicializa os serviços de acordo com a configuração em `src/config.json` e liga os módulos de infraestrutura apenas quando eles são necessários.

O projeto está organizado como um monólito modular pragmático:

- `src/` contém o backend principal, o dashboard legado e os serviços centrais.
- `frontend/` contém uma aplicação Angular separada, hoje usada como base de evolução da interface.
- `modules/` reúne serviços paralelos, legados ou satélites, como o gerador de spam e o gateway mock.

## Funcionalidades Atuais

- Comunicação em tempo real via WebSocket.
- Broadcast de mensagens para todos os clientes conectados.
- Gerador de mensagens de teste em modo dev.
- Painel web legado com chat, gráfico e análise rápida.
- Resumo de análise em memória com métricas de mensagens, remetentes e origens.
- Persistência de mensagens em log local com limpeza automática.
- Servidor HTTP/Express para páginas, API e autenticação Twitch.
- Configuração centralizada com fallback automático.
- Suporte a SQLite em disco e em memória.
- Integração com Twitch e fluxo OAuth2.
- Módulos paralelos para spam bot, gateway mock e logger legado.

## O Que Está Realmente Em Uso

### Backend principal

- `src/services/app/bootstrapApp.js` coordena a inicialização.
- `src/services/websocket/` hospeda o WebSocket principal.
- `src/services/webmanager/express_bootstrap.js` sobe a API e o site estático.
- `src/services/dataAnalysis/messageAnalysis.js` mantém o resumo de análise em memória.
- `src/services/dataControl/dataControl.js` grava mensagens em log.
- `src/services/settings/configStore.js` carrega e salva a configuração central.

### Front-end funcional hoje

- O dashboard funcional atual está em `src/public/`.
- `src/public/index.html` monta a tela principal.
- `src/public/scripts.js` consome WebSocket, API de análise e monta o painel.
- `src/public/dashboard.css` aplica o visual terminal/industrial do dashboard.

### Front-end Angular

- Existe uma workspace separada em `frontend/`.
- Hoje ela está em fase de evolução e não substitui o dashboard legado.
- Se você quiser seguir a interface Angular, ela pode ser usada como base para uma nova UI oficial.

## Como Funciona o Fluxo de Mensagens

1. Um cliente ou gerador produz uma mensagem.
2. O WebSocket principal normaliza o payload em `src/services/websocket/ws_functions.js`.
3. A mensagem é registrada por `messageAnalysis.register(...)`.
4. O conteúdo também vai para `dataControl('addMessage', ...)`, que grava em `src/logs/chat_log.txt`.
5. O payload é broadcastado para todos os clientes conectados.
6. O dashboard em `src/public/scripts.js` recebe o evento e atualiza o chat, o gráfico e a análise rápida.

## Modo Desenvolvimento

Quando `type_ambience` está em `dev`, o bootstrap habilita o gerador de spam em `modules/service_spamChatBot/spammer.deprecated.js`.

Esse gerador agora está ligado ao WebSocket principal por callback, então as mensagens de teste aparecem no front-end e entram no mesmo fluxo de análise dos demais eventos.

Configuração dev típica:

```json
{
  "type_ambience": "dev",
  "use_webserver": true,
  "debbug": true,
  "dev_config": {
    "dev_websocket_port": 8181,
    "dev_express_port": 3232,
    "enable_spam": true,
    "connected_chat_notify": true,
    "print_spam_chats": true
  },
  "use_websocket": true
}
```

## Painel Web

O dashboard legado em `src/public/` mostra:

- Lista de mensagens em tempo real.
- Status da conexão WebSocket.
- Gráfico de volume de mensagens por intervalo.
- Seção de análise rápida com:
  - total de mensagens,
  - remetentes únicos,
  - origens únicas,
  - último preview recebido,
  - top remetentes,
  - top origens.

Esse painel é a interface funcional mais completa do projeto no estado atual.

## API e Endpoints

### Web UI

- `GET /` -> dashboard principal.
- `GET /config` -> página de configuração.
- `GET /help` -> ajuda em inglês.
- `GET /ajuda` -> ajuda em português.

### Configuração

- `GET /api/config` -> retorna a configuração atual.
- `POST /api/config` -> salva a configuração recebida.

### Análise

- `GET /api/analysis/summary` -> retorna o resumo atual de mensagens.

Resposta típica:

```json
{
  "ok": true,
  "data": {
    "totalMessages": 42,
    "bySender": { "dev-spammer": 42 },
    "byOrigin": { "dev-spam-generator": 42 },
    "byType": { "text": 42 },
    "lastMessageAt": "2026-06-11T12:34:56.000Z",
    "lastMessagePreview": "Mensagem gerada...",
    "topSenders": [{ "name": "dev-spammer", "count": 42 }],
    "topOrigins": [{ "name": "dev-spam-generator", "count": 42 }]
  }
}
```

### Twitch OAuth2

- `GET /auth/twitch` -> inicia o fluxo OAuth2.
- `GET /auth/callback` -> recebe o callback da Twitch.

## Formato das Mensagens

O WebSocket principal trabalha com mensagens normalizadas e payloads JSON.

### Mensagem de chat

```json
{
  "type": "chat-message",
  "data": {
    "id": "uuid-opcional",
    "sender": "username",
    "content": "texto da mensagem",
    "origin": "twitch|discord|websocket|dev-spam-generator",
    "type": "text",
    "timestamp": "2026-06-11T12:34:56.000Z"
  }
}
```

### Mensagem de conexão

Quando `connected_chat_notify` está ativo, o servidor envia `conectado` ao cliente.

## Configuração

Toda a configuração vem de `src/config.json` e é carregada por `src/services/settings/configStore.js`.

Campos principais:

- `type_ambience`: `dev` ou `prod`.
- `use_webserver`: liga ou desliga o Express.
- `use_websocket`: liga ou desliga o WebSocket.
- `debbug`: ativa logs e conexões de debug.
- `dev_config.dev_websocket_port`: porta do WebSocket em dev.
- `dev_config.dev_express_port`: porta do Express em dev.
- `dev_config.enable_spam`: ativa o gerador de mensagens de teste.
- `dev_config.connected_chat_notify`: mostra logs de conexão/desconexão.
- `dev_config.print_spam_chats`: imprime mensagens geradas no console.
- `websocket_port`: porta do WebSocket em produção.
- `express_port`: porta do Express em produção.
- `database.enable_database`: liga a camada de banco.
- `database.enable_in_disk_db`: usa SQLite em disco.
- `database.enable_in_memory_db`: usa SQLite em memória.
- `data_control.storage_messages_enabled`: ativa o log persistente.
- `data_control.max_stored_messages`: limite de mensagens no log.
- `data_control.message_cleanup_interval_ms`: intervalo de limpeza.
- `data_analysis.enable_data_analysis`: ativa o resumo de análise.
- `data_analysis.data_analysis_interval_ms`: intervalo da coleta.

O sistema usa fallback automático caso a configuração principal falhe.

## Requisitos

- Node.js 18+ recomendado.
- npm.

## Instalação

```bash
npm install
```

## Como Executar

### Aplicação principal

```bash
npm start
```

ou

```bash
npm run dev
```

O backend principal sobe a partir de `src/index.js`.

### Front-end legado funcional

Abra a interface servida pelo Express no ambiente configurado. Em dev, isso normalmente fica em:

- Express: `http://localhost:3232`
- WebSocket: `ws://localhost:8181`

### Front-end Angular separado

```bash
cd frontend
npm install
npm start
```

Essa workspace é separada do dashboard legado e pode ser evoluída como interface alternativa.

## Scripts Disponíveis

No `package.json` da raiz:

- `npm start` -> inicia `src/index.js`.
- `npm run dev` -> inicia `src/index.js`.
- `npm test` -> executa ESLint.
- `npm run docs` -> gera documentação JSDoc.
- `npm run build` -> gera build JS e copia assets de configuração.
- `npm run build:js` -> empacota os arquivos JS.
- `npm run build:assets` -> copia JSON e `.env` de `src/` para `dist/`.

No `frontend/`:

- `npm start` -> Angular dev server.
- `npm run build` -> build Angular.
- `npm test` -> testes da workspace Angular.

## Estrutura Resumida

```text
streamchatrelay2/
├── src/
│   ├── index.js
│   ├── config.json
│   ├── logs/
│   ├── public/
│   │   ├── index.html
│   │   ├── scripts.js
│   │   └── dashboard.css
│   └── services/
│       ├── app/
│       ├── dataAnalysis/
│       ├── dataControl/
│       ├── settings/
│       ├── webmanager/
│       └── websocket/
├── modules/
│   ├── service_spamChatBot/
│   ├── gateway/
│   └── logger/
├── frontend/
└── docs/
```

## Módulos Paralelos

- `modules/service_spamChatBot/` é um serviço paralelo de geração e transporte de mensagens de teste.
- `modules/gateway/` é um gateway mock/legado.
- `modules/logger/` é um módulo de logging paralelo.

Esses módulos existem no repositório, mas nem todos fazem parte do bootstrap principal da aplicação.

## Pontos de Extensão

Se você for evoluir o projeto, os pontos mais importantes hoje são:

- Consolidar mais regras em `src/services/dataAnalysis/`.
- Evoluir o dashboard legado ou migrar a experiência para `frontend/`.
- Criar testes para bootstrap, WebSocket e API.
- Separar claramente produto principal, legado e módulos paralelos.

Veja também [ARQUITETURA_E_PROXIMOS_PASSOS.md](ARQUITETURA_E_PROXIMOS_PASSOS.md) para uma visão mais estratégica da evolução.

## Solução de Problemas

- Se o spam de dev não aparecer, confirme `type_ambience = "dev"` e `dev_config.enable_spam = true`.
- Se o painel não atualizar, confirme que o Express está ativo e que o WebSocket principal está na porta correta.
- Se a configuração parecer antiga, verifique `src/services/settings/configStore.js` e o fallback usado pelo carregador.
- Se a interface Angular abrir vazia, isso é esperado hoje: ela ainda está em evolução e não substitui o dashboard legado.

## Documentação Relacionada

- [Arquitetura e próximos passos](ARQUITETURA_E_PROXIMOS_PASSOS.md)
- [Ajuda em português](src/help_BR.md)
- [Help in English](src/help.md)
- [Guia de OAuth2 da Twitch](TWITCH_OAUTH2_GUIDE.md)
- [Exemplo de uso](EXAMPLE_USAGE.md)

## Autor

Michael Mello

![](docs/displaygif.gif)
# Stream Chat Relay

Uma aplicação em tempo real para gerenciar e retransmitir mensagens de chat em múltiplas plataformas de streaming. O projeto utiliza WebSocket para comunicação em tempo real, Express.js para a API web e SQLite para armazenamento de dados.

## 🎯 Funcionalidades

- **Comunicação em Tempo Real**: WebSocket para troca instantânea de mensagens entre clientes
- **Retransmissão de Mensagens**: Broadcast automático de mensagens para todos os clientes conectados
- **Armazenamento de Mensagens**: Log persistente de mensagens com limpeza automática
- **Análise de Dados**: Coleta e análise de métricas da aplicação (configurável)
- **Banco de Dados Híbrido**: Suporte para SQLite em disco e em memória
- **Modo Desenvolvimento**: Gerador de spam de chat para testes automatizados
- **Notificações de Conexão**: Feedback de conexão/desconexão de clientes
- **Interface Web**: Cliente web para interação com o sistema
- **Backup de Configurações**: Fallback automático para configurações padrão

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para HTTP e API REST
- **WebSocket (ws)** - Protocolo para comunicação em tempo real
- **SQLite3 (better-sqlite3)** - Banco de dados relacional
- **Marked** - Parser Markdown para documentação

## 📋 Requisitos

- Node.js 16+
- npm 8+

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

3. Configure o ambiente (opcional):
```bash
# Edite o arquivo de configuração
nano src/config.json
```

## 🏃 Como Usar

### Modo Desenvolvimento

```bash
npm start
```

Será iniciado com as seguintes configurações:
- WebSocket na porta `8181`
- Express na porta `3131`
- Gerador de spam de chat **ativado**
- Notificações de conexão/desconexão no console
- Análise de dados a cada 6 segundos
- Armazenamento de mensagens (máx. 200 mensagens)

### Modo Produção

Configure o `src/config.json`:
```json
{
  "type_ambience": "prod",
  "use_webserver": true,
  "debbug": false,
  "database": {
    "enable_database": true,
    "enable_in_disk_db": true,
    "enable_in_memory_db": true,
    "indisk_db_name": "streamchatrelay_data"
  },
  "data_control": {
    "storage_messages_enabled": true,
    "max_stored_messages": 200,
    "message_cleanup_interval_ms": 5000
  },
  "data_analysis": {
    "enable_data_analysis": true,
    "data_analysis_interval_ms": 6000
  },
  "websocket_port": 8080,
  "express_port": 3030
}
```

## 📁 Estrutura do Projeto

```
streamchatrelay/
├── package.json                        # Dependências e scripts
├── README.md                           # Este arquivo
├── src/
│   ├── index.js                        # Arquivo principal de inicialização
│   ├── config.json                     # Configurações de ambiente
│   ├── help.md                         # Documentação em inglês
│   ├── help_BR.md                      # Documentação em português
│   ├── interface/
│   │   ├── chat_interface.js          # Interface de chat
│   │   └── twitch/
│   │       └── twitch_pool_interface.js # Interface Twitch
│   ├── logs/
│   │   └── chat_log.txt               # Arquivo de log de mensagens
│   ├── public/
│   │   ├── index.html                 # Interface web do cliente
│   │   └── scripts.js                 # Script JavaScript do cliente
│   └── services/
│       ├── dataBase/
│       │   ├── sqlite3_bootstrap.js              # Inicialização SQLite em disco
│       │   ├── sqlite3_bootstrap_memory.js       # Inicialização SQLite em memória
│       │   └── dataBases/                       # Diretório de bancos de dados
│       ├── dataControl/
│       │   └── dataControl.js                   # Gerenciamento de dados e logs
│       ├── etc/
│       │   ├── config_backup.json              # Configuração padrão de fallback
│       │   ├── loadsettings.js                 # Carregador de configurações
│       │   └── startUtilities.js               # Utilitários de inicialização
│       ├── externalConnections/
│       │   ├── connectionHUB.js                # Hub de conexões externas
│       │   └── twitch/
│       │       └── connectionWS.js             # Conexão WebSocket Twitch
│       ├── spamGenerator/
│       │   ├── fakeMessageData.js              # Gerador de dados fictícios
│       │   └── liveChatSpam.js                 # Gerador de mensagens de teste
│       ├── webManager/
│       │   └── express_bootstrap.js            # Inicialização do Express
│       └── webSocket/
│           ├── websocket_bootstrap.js          # Inicialização do WebSocket
│           ├── websocket_starter.js            # Inicialização do servidor WS
│           └── ws_functions.js                 # Funções de manipulação WS
```

## ⚙️ Configuração Detalhada

O arquivo `src/config.json` controla todos os comportamentos da aplicação:

```json
{
  "type_ambience": "dev",                    // Ambiente: "dev" ou "prod"
  "use_webserver": true,                     // Ativar servidor web Express
  "debbug": true,                            // Modo debug
  "dev_config": {                            // Configurações apenas para "dev"
    "dev_websocket_port": 8181,              // Porta WebSocket em desenvolvimento
    "dev_express_port": 3131,                // Porta Express em desenvolvimento
    "enable_spam": true,                     // Ativar gerador de mensagens de teste
    "connected_chat_notify": true,           // Log de conexões/desconexões
    "print_spam_chats": false                // Log de todas as mensagens geradas
  },
  "database": {                              // Configurações de banco de dados
    "enable_database": true,                 // Ativar SQLite
    "enable_in_disk_db": true,               // Armazenar em disco
    "enable_in_memory_db": true,             // Usar banco em memória
    "indisk_db_name": "streamchatrelay_data" // Nome do banco em disco
  },
  "data_control": {                          // Controle de armazenamento de dados
    "storage_messages_enabled": true,        // Ativar log de mensagens
    "max_stored_messages": 200,              // Máximo de mensagens armazenadas
    "message_cleanup_interval_ms": 5000      // Intervalo de limpeza (ms)
  },
  "data_analysis": {                         // Análise de dados
    "enable_data_analysis": true,            // Ativar coleta de métricas
    "data_analysis_interval_ms": 6000        // Intervalo de análise (ms)
  },
  "websocket_port": 8080,                    // Porta WebSocket em produção
  "express_port": 3030                       // Porta Express em produção
}
```

> ⚠️ **Nota**: Se algum valor em `config.json` estiver inválido ou ausente, a aplicação usará automaticamente `src/etc/config_backup.json` como fallback.

## 📊 Variáveis de Ambiente

A aplicação não usa arquivo `.env`, mas você pode editar `src/config.json` diretamente para configurar:
- Portas de servidor
- Habilitar/desabilitar recursos
- Intervalos de processamento
- Nomes de banco de dados

## 📖 Documentação Adicional

- [Guia em Português (help_BR.md)](./src/help_BR.md)
- [Guia em Inglês (help.md)](./src/help.md)

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença ISC - veja o arquivo LICENSE para detalhes.

## 👤 Autor

**Michael Mello** - [@drakomichael](https://github.com/drakomichael)

## 🔗 Links

- [GitHub Repository](https://github.com/seu-usuario/streamchatrelay)
- [Documentação (PT-BR)](./src/help_BR.md)
- [Documentation (EN)](./src/help.md)

---

**Última atualização**: Janeiro 16, 2026 | **Versão**: 1.0.0
