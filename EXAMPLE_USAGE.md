# OAuth2 Twitch Integration - Quick Start Example

## Exemplo Prático de Uso

Este documento mostra um exemplo prático de como usar a nova integração OAuth2 com Twitch.

## Passo a Passo

### 1. Obter Credenciais da Twitch

1. Acesse https://dev.twitch.tv/console/apps
2. Crie uma nova aplicação ou use uma existente
3. Copie o **Client ID**
4. Gere um **Access Token** em https://twitchtokengenerator.com/

### 2. Configurar a Aplicação

Edite o arquivo `src/config.json`:

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
    "print_spam_chats": false
  },
  "twitch": {
    "client_id": "seu_client_id_aqui",
    "access_token": "seu_access_token_aqui",
    "enable_twitch_connection": true
  },
  "database": {
    "enable_database": false,
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
  "use_websocket": true,
  "websocket_port": 8080,
  "express_port": 3030
}
```

### 3. Executar a Aplicação

```bash
npm install
npm start
```

### 4. Logs Esperados

Quando a aplicação iniciar com sucesso, você verá logs similares a estes:

```
[BOOTSTRAP] Starting StreamChatRelay application...
WebSocket inicializado com sucesso
Debug Bootstrap initialized.
WebSocket Bootstrap is operational.
[Debug Bootstrap] Initializing Twitch EventSub connection...
[Twitch WS] Connecting to Twitch EventSub WebSocket...
[Twitch WS] WebSocket connection established
[ConnectionHUB] ✓ Twitch WebSocket connected
[Twitch WS] Received message type: session_welcome
[Twitch WS] Welcome received. Session ID: AQoQILE7VHoiLE...
[Twitch WS] Keepalive timeout: 10s
[ConnectionHUB] ✓ Twitch OAuth2 authenticated - Session: AQoQILE7VHoiLE...
[ConnectionHUB] OAuth2 handshake completed successfully
[BOOTSTRAP] SUCCESS STARTER
 Activated modules: WebSocket Server, Express Web Server, Debug Connection, Spam Generator

Express app listening on port 3232
```

## O Que Foi Implementado

### Handshake OAuth2 Completo

O handshake OAuth2 com Twitch EventSub inclui:

1. **Conexão WebSocket**: Estabelece conexão com `wss://eventsub.wss.twitch.tv/ws`
2. **Recebimento do Session Welcome**: Twitch envia uma mensagem de boas-vindas com Session ID
3. **Autenticação**: As credenciais OAuth2 são validadas automaticamente pelo Twitch
4. **Session ID**: ID único da sessão é armazenado para uso futuro
5. **Keepalive**: Sistema automático de keepalive para manter conexão ativa

### Funcionalidades Implementadas

- ✅ Conexão automática ao iniciar aplicação (quando `enable_twitch_connection: true`)
- ✅ Validação de credenciais OAuth2
- ✅ Tratamento de mensagens EventSub:
  - `session_welcome` - Recebe Session ID
  - `session_keepalive` - Mantém conexão ativa
  - `notification` - Recebe eventos de subscrições
  - `session_reconnect` - Reconecta quando solicitado
  - `revocation` - Trata revogação de subscrições
- ✅ Reconexão automática com backoff exponencial (até 5 tentativas)
- ✅ Monitoramento de timeout de keepalive
- ✅ Logs detalhados de todas as operações

## Próximos Passos

Agora que o handshake OAuth2 está funcionando, você pode:

1. **Criar Subscrições**: Use a API do Twitch para criar subscrições EventSub
   - As subscrições devem usar o Session ID obtido no handshake
   - Exemplo: subscrever a eventos de chat, follows, subscriptions, etc.

2. **Processar Notificações**: Implementar handlers para eventos específicos
   - Os eventos chegam através da mensagem `notification`
   - Cada evento contém dados específicos do tipo de subscrição

3. **Integrar com o Chat Relay**: Conectar os eventos do Twitch com o sistema de relay
   - Retransmitir mensagens de chat do Twitch para outros clientes
   - Sincronizar eventos entre plataformas

## Exemplo de Uso do Session ID

Após o handshake, você pode acessar o Session ID para criar subscrições:

```javascript
import debugBootstrap from './src/services/app/debugBootstrap.js';

// Obter a instância da conexão Twitch
const twitchConnection = debugBootstrap.getTwitchConnection();

// Obter o Session ID
const sessionId = twitchConnection.getSessionId();

console.log('Session ID:', sessionId);
// Use este Session ID para criar subscrições via API do Twitch
```

## Troubleshooting

### Erro: "Missing client_id or access_token"
- Verifique se as credenciais estão corretas no `config.json`
- Certifique-se de que `enable_twitch_connection` está `true`

### Erro: "WebSocket connection failed"
- Verifique sua conexão com a internet
- Confirme que o token OAuth2 é válido e não expirou

### Conexão fecha após alguns segundos
- Verifique se o keepalive está funcionando
- Logs devem mostrar "[Twitch WS] Keepalive received" periodicamente

## Referências

- [Twitch EventSub WebSocket Documentation](https://dev.twitch.tv/docs/eventsub/handling-websocket-events)
- [Twitch OAuth2 Guide](https://dev.twitch.tv/docs/authentication)
- [TWITCH_OAUTH2_GUIDE.md](./TWITCH_OAUTH2_GUIDE.md) - Guia completo de configuração
