# Arquitetura em Camadas - service_spamChatBot

Este documento descreve o papel de cada camada e arquivo do microserviço apos a refatoracao para Controller, DTO, Repository e Services.

## Visao Geral

O microservico foi organizado para separar responsabilidades:

- Controller: recebe HTTP, valida entrada e monta resposta.
- DTO: define contratos de entrada/saida.
- Repository: integra com infraestrutura (RabbitMQ e WebSocket).
- Services: contem regras de negocio e orquestracao do spam.
- Middleware: encapsula autenticacao para reutilizacao em futuras rotas.
- Bootstrap (app.js): composicao de dependencias e registro de rotas.

Fluxo principal:

1. Requisicao chega em uma rota.
2. Middleware de autenticacao valida token quando a rota e protegida.
3. Controller valida payload com DTO e delega para Service.
4. Service gera mensagem e manda para o Repository.
5. Repository publica para RabbitMQ e/ou WebSocket.
6. Controller responde com status padronizado.

## Camada Bootstrap

### app.js

Responsabilidades:

- Carregar configuracoes do .env via dotenv.
- Instanciar Repository, Services, Controller e Middleware.
- Registrar rotas e middlewares do Express.
- Iniciar servidor HTTP.
- Encerrar conexoes de forma graciosa (SIGINT/SIGTERM).

Variaveis importantes lidas do ambiente:

- PORT
- RABBITMQ_URL
- QUEUE_NAME
- RETRY_INTERVAL
- MAX_RETRIES
- ENABLE_WEBSOCKET
- WEBSOCKET_PORT
- WEBSOCKET_PING_INTERVAL
- API_TOKEN

## Camada Middleware

### src/middlewares/authMiddleware.js

Responsabilidades:

- Extrair token via `x-api-key` ou `Authorization: Bearer <token>`.
- Validar token contra valor configurado no ambiente.
- Bloquear requisicoes nao autorizadas com HTTP 401.
- Permitir reutilizacao em qualquer rota futura.

Uso recomendado em novas rotas protegidas:

- Aplicar `authMiddleware` antes do handler/controller da rota.

## Camada Controller

### src/Controller/SpamController.js

Responsabilidades:

- Receber requests das rotas de spam.
- Validar payload de /start com StartSpamDTO.
- Transformar erros de validacao em resposta HTTP 400 com detalhes.
- Delegar start/stop/status para os Services/Repository.
- Montar resposta de status usando StatusResponseDTO.

Endpoints ligados ao controller:

- GET /start (protegido)
- POST /start (protegido)
- GET /stop (protegido)
- POST /stop (protegido)
- GET /status (publico)

## Camada DTO

### src/DTO/StartSpamDTO.js

Responsabilidades:

- Definir schema de entrada para iniciar spam.
- Aplicar defaults de configuracao.
- Validar coerencia de intervalo (maxMs >= minMs).
- Expor parse/safeParse para uso no Controller.

Estrutura validada:

- dev_config.enable_spam (boolean)
- dev_config.print_spam_chats (boolean)
- interval.minMs (int >= 0)
- interval.maxMs (int >= 0 e >= minMs)
- transports.rabbitmq (boolean)
- transports.websocket (boolean)

### src/DTO/GeneratedMessageDTO.js

Responsabilidades:

- Definir formato canonico de mensagem gerada.
- Montar payload de transporte com texto formatado e dados brutos.

### src/DTO/StatusResponseDTO.js

Responsabilidades:

- Padronizar resposta de status agregando:
  - estado do service (rodando/parado)
  - saude do RabbitMQ
  - saude do WebSocket
  - metricas basicas de envio

## Camada Services

### src/services/SpamGeneratorService.js

Responsabilidades:

- Gerar mensagens aleatorias com base em fakeMessageData.
- Formatar mensagem em texto humano.
- Calcular proximo intervalo aleatorio entre min e max.
- Converter mensagem para payload de transporte via DTO.

### src/services/SpamOrchestratorService.js

Responsabilidades:

- Controlar ciclo de vida do spam (start/stop).
- Gerenciar loop de envio por timer.
- Aplicar configuracao atual de impressao e transportes.
- Registrar metadados de execucao (sentCount, lastMessageAt).
- Delegar envio ao Repository.

## Camada Repository

### src/Repository/SpamTransportRepository.js

Responsabilidades:

- Encapsular conexao e envio para RabbitMQ.
- Aplicar estrategia de retry/backoff em falhas RabbitMQ.
- Encapsular publicacao em WebSocket.
- Expor status operacional de cada canal.
- Encerrar recursos de infraestrutura no shutdown.

Canais suportados:

- RabbitMQ (fila duravel)
- WebSocket (broadcast para clientes conectados)

## Infraestrutura de WebSocket

### spamChatBot_WebSocketServer.js

Responsabilidades:

- Subir servidor WebSocket singleton.
- Manter conjunto de clientes conectados.
- Fazer broadcast de mensagens para os clientes.
- Enviar ping periodico para conexoes ativas.
- Expor contagem de clientes conectados.
- Fechar servidor e clientes no shutdown.

## Fonte de Dados Fake

### fakeMessageData.js

Responsabilidades:

- Fornecer arrays de dados ficticios para gerar mensagens de spam.
- Alimentar o SpamGeneratorService.

## Sobre o arquivo legado spammer.js

### spammer.js

Estado atual:

- Continua no projeto como legado/referencia.
- O fluxo principal passou a usar Services e Repository no app.js.

Recomendacao:

- Em uma proxima iteracao, remover ou marcar explicitamente como deprecated para evitar uso acidental.

## Boas praticas para evolucao

1. Novas rotas protegidas devem usar o authMiddleware.
2. Toda entrada HTTP deve ter DTO proprio com validacao.
3. Integracoes externas devem entrar na camada Repository.
4. Regras de negocio devem ficar somente em Services.
5. Controller deve continuar fino, sem regras de negocio complexas.
6. Bootstrap deve ficar apenas com composicao e inicializacao.
