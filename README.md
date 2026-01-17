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
