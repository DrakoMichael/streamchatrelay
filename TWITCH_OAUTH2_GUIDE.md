# Integração Twitch OAuth2 - Guia de Configuração

## 📋 Visão Geral

Este guia explica como configurar e usar a integração OAuth2 com o WebSocket EventSub da Twitch.

## 🔑 Obtendo Credenciais da Twitch

### Passo 1: Criar uma Aplicação Twitch

1. Acesse o [Console de Desenvolvedores da Twitch](https://dev.twitch.tv/console/apps)
2. Faça login com sua conta Twitch
3. Clique em "Register Your Application"
4. Preencha os campos:
   - **Name**: Nome da sua aplicação (ex: "Stream Chat Relay")
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback` (para desenvolvimento)
   - **Category**: Chat Bot ou Application Integration
5. Clique em "Create"

### Passo 2: Obter Client ID e Token

1. Na página da sua aplicação, copie o **Client ID**
2. Clique em "Manage" e depois em "New Secret" para gerar um Client Secret (guarde em local seguro)
3. Para gerar um Access Token, você pode usar:
   - [Twitch Token Generator](https://twitchtokengenerator.com/) (recomendado para testes)
   - Ou implementar o fluxo OAuth2 completo

## ⚙️ Configuração

### Opção 1: Configuração via config.json (Recomendado para Desenvolvimento)

Edite o arquivo `src/config.json`:

```json
{
  "type_ambience": "dev",
  "debbug": true,
  "twitch": {
    "client_id": "seu_client_id_aqui",
    "access_token": "seu_access_token_aqui",
    "enable_twitch_connection": true
  }
}
```

### Opção 2: Usando Variáveis de Ambiente (Recomendado para Produção)

1. Copie o arquivo `.env.example`:
```bash
cp .env.example .env
```

2. Edite o `.env` com suas credenciais:
```env
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_ACCESS_TOKEN=seu_access_token_aqui
```

3. Atualize seu código para carregar as variáveis de ambiente (futuro)

## 🚀 Usando a Conexão Twitch

### Iniciar a Aplicação

Com o debug mode ativado (`"debbug": true` no config.json):

```bash
npm start
```

Você verá logs indicando:
```
[Debug Bootstrap] Initializing Twitch EventSub connection...
[Twitch WS] Connecting to Twitch EventSub WebSocket...
[Twitch WS] WebSocket connection established
[ConnectionHUB] ✓ Twitch WebSocket connected
[Twitch WS] Welcome received. Session ID: xxxxx
[ConnectionHUB] ✓ Twitch OAuth2 authenticated - Session: xxxxx
```

### Eventos Suportados

A implementação atual suporta os seguintes tipos de mensagem do Twitch EventSub:

1. **session_welcome**: Recebido ao conectar, contém o Session ID
2. **session_keepalive**: Mantém a conexão ativa
3. **notification**: Eventos de subscrições (chat, follows, etc.)
4. **session_reconnect**: Servidor solicita reconexão
5. **revocation**: Subscrição foi revogada

## 🔧 Funcionalidades Implementadas

### OAuth2 Handshake
- ✅ Conexão WebSocket com EventSub da Twitch
- ✅ Autenticação automática com client_id e access_token
- ✅ Recebimento e processamento de Session ID
- ✅ Gerenciamento de keepalive automático
- ✅ Reconexão automática com backoff exponencial
- ✅ Tratamento de erros e desconexões

### Fluxo de Conexão

```
1. Aplicação inicia com debug=true
2. TwitchConnectionWS é instanciado com credenciais
3. WebSocket conecta a wss://eventsub.wss.twitch.tv/ws
4. Twitch envia session_welcome com Session ID
5. Conexão estabelecida e autenticada (OAuth2 handshake completo)
6. Aplicação pode agora criar subscrições usando o Session ID
```

## 📊 Monitoramento

### Logs de Conexão

Os logs mostram o status da conexão:

```
[Twitch WS] Connecting to Twitch EventSub WebSocket...
[Twitch WS] WebSocket connection established
[Twitch WS] Received message type: session_welcome
[Twitch WS] Welcome received. Session ID: AQoQILE...
[Twitch WS] Keepalive timeout: 10s
[ConnectionHUB] ✓ Twitch OAuth2 authenticated - Session: AQoQILE...
[ConnectionHUB] OAuth2 handshake completed successfully
```

### Logs de Keepalive

```
[Twitch WS] Keepalive received
```

### Logs de Erro

```
[Twitch WS] Missing client_id or access_token in configuration
[ConnectionHUB] ✗ Twitch error: Missing OAuth2 credentials
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca commite suas credenciais no repositório!

- Use o arquivo `.env` para credenciais (já está no .gitignore)
- Mantenha seu Client Secret seguro
- Não compartilhe seu Access Token
- Para produção, implemente refresh token automático

## 🐛 Solução de Problemas

### "Missing client_id or access_token"
- Verifique se as credenciais estão corretamente configuradas no `config.json`
- Certifique-se de que `enable_twitch_connection: true`

### "WebSocket error"
- Verifique sua conexão de internet
- Confirme que as credenciais são válidas
- Verifique se o token não expirou

### "Max reconnection attempts reached"
- Pode indicar problema com as credenciais
- Ou problemas de rede persistentes
- Reinicie a aplicação após corrigir o problema

## 📚 Recursos

- [Twitch EventSub WebSocket Documentation](https://dev.twitch.tv/docs/eventsub/handling-websocket-events)
- [Twitch OAuth2 Documentation](https://dev.twitch.tv/docs/authentication)
- [Twitch Developer Console](https://dev.twitch.tv/console)

## 🔄 Próximas Melhorias

- [ ] Implementar criação de subscrições EventSub via API
- [ ] Adicionar suporte para refresh token automático
- [ ] Implementar handlers específicos para diferentes tipos de eventos
- [ ] Adicionar persistência de Session ID
- [ ] Interface web para gerenciar subscrições
