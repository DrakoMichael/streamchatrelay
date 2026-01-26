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

### Passo 2: Obter Client ID e Client Secret

1. Na página da sua aplicação, copie o **Client ID**
2. Clique em "Manage" e depois em "New Secret" para gerar um **Client Secret** (guarde em local seguro)
3. Configure as credenciais no arquivo `src/config.json`:
   ```json
   {
     "twitch": {
       "client_id": "seu_client_id_aqui",
       "client_secret": "seu_client_secret_aqui",
       "enable_twitch_connection": false
     }
   }
   ```

### Passo 3: Autenticar via OAuth2 (Recomendado)

**NOVO!** Agora você pode obter seus tokens automaticamente usando o fluxo OAuth2:

1. Inicie a aplicação:
   ```bash
   npm start
   ```

2. Acesse no navegador:
   ```
   http://localhost:3232/auth/twitch
   ```
   (Ajuste a porta conforme seu `dev_express_port` em `config.json`)

3. Você será redirecionado para a página de autorização da Twitch

4. Clique em "Autorizar" para permitir que a aplicação acesse sua conta

5. Após a autorização, você será redirecionado de volta e os tokens serão salvos automaticamente no `config.json`

6. Para ativar a conexão, altere `enable_twitch_connection: true` no `config.json` e reinicie a aplicação

### Passo 3 (Alternativa): Gerar Token Manualmente

Se preferir gerar o token manualmente:

1. Use o [Twitch Token Generator](https://twitchtokengenerator.com/) (recomendado para testes rápidos)
2. Ou use a ferramenta CLI da Twitch
3. Cole o token gerado no campo `access_token` do `config.json`

## ⚙️ Configuração

### Configuração via config.json

Edite o arquivo `src/config.json`:

```json
{
  "type_ambience": "dev",
  "debbug": true,
  "twitch": {
    "client_id": "seu_client_id_aqui",
    "client_secret": "seu_client_secret_aqui",
    "access_token": "obtido_via_oauth_ou_manual",
    "refresh_token": "obtido_via_oauth",
    "enable_twitch_connection": true
  }
}
```

**Importante**: 
- O `client_secret` é necessário apenas para o fluxo OAuth2 automático
- Se você gerar o token manualmente, pode deixar o `client_secret` vazio
- Os tokens `access_token` e `refresh_token` serão preenchidos automaticamente se você usar `/auth/twitch`

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

### OAuth2 Flow Completo
- ✅ Endpoint de inicialização OAuth2 (`/auth/twitch`)
- ✅ Endpoint de callback OAuth2 (`/auth/callback`)
- ✅ Troca automática de código por access token
- ✅ Salvamento automático de tokens no config.json
- ✅ Suporte para refresh tokens
- ✅ Interface web para autorização

### OAuth2 Handshake WebSocket EventSub
- ✅ Conexão WebSocket com EventSub da Twitch
- ✅ Autenticação automática com client_id e access_token
- ✅ Recebimento e processamento de Session ID
- ✅ Gerenciamento de keepalive automático
- ✅ Reconexão automática com backoff exponencial
- ✅ Tratamento de erros e desconexões

### Fluxo de Conexão

```
Opção 1: Fluxo OAuth2 Completo (Recomendado)
1. Usuário acessa /auth/twitch
2. Aplicação redireciona para página de autorização da Twitch
3. Usuário autoriza a aplicação
4. Twitch redireciona para /auth/callback com código de autorização
5. Aplicação troca código por access_token e refresh_token
6. Tokens são salvos automaticamente no config.json
7. Usuário ativa enable_twitch_connection no config.json
8. Aplicação reiniciada

Opção 2: Token Manual
1. Usuário gera token manualmente
2. Cola no config.json
3. Ativa enable_twitch_connection

Após obter o token (qualquer opção):
1. Aplicação inicia com debug=true e enable_twitch_connection=true
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

- [x] Implementar fluxo OAuth2 completo com endpoints de callback
- [x] Adicionar suporte para obtenção automática de tokens
- [ ] Implementar refresh token automático quando access_token expirar
- [ ] Implementar criação de subscrições EventSub via API
- [ ] Implementar handlers específicos para diferentes tipos de eventos
- [ ] Adicionar persistência de Session ID
- [ ] Interface web para gerenciar subscrições
- [ ] Adicionar validação de token antes de conectar
