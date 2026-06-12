# Arquitetura e próximos passos

## Visão geral

O projeto hoje se comporta como um monólito modular em Node.js, com um núcleo principal em `src/` e alguns módulos paralelos em `modules/`. O fluxo principal é simples: `src/index.js` carrega a configuração e chama `src/services/app/bootstrapApp.js`, que decide quais serviços sobem na aplicação.

Na prática, a base já entrega um servidor WebSocket, um servidor HTTP/Express, persistência SQLite, logs em arquivo, integração com Twitch e um gerador de spam para ambiente de desenvolvimento. O objetivo do produto fica mais claro quando visto como uma centralização de chat e eventos de lives externas, com foco em análise de dados para streamer: juntar mensagens, sinais de plataforma e informações operacionais para gerar leitura útil de engajamento, volume, comportamento e contexto. Em paralelo, existem módulos que parecem serviços satélites ou protótipos independentes, como `modules/service_spamChatBot/` e `modules/gateway/`.

## O que o projeto já faz

- Sobe a aplicação a partir de um carregador central de configuração em `src/services/settings/configStore.js`, com fallback em `src/services/settings/config_backup.js`.
- Inicializa WebSocket em `src/services/websocket/`.
- Inicializa Express e serve a interface web em `src/services/webmanager/express_bootstrap.js`.
- Mantém logs em arquivo em `src/services/app/logManager.js`.
- Inicializa SQLite em disco e em memória em `src/services/dataBase/`.
- Processa conexões externas, com foco em Twitch, em `src/services/externalConnections/`.
- Possui uma UI separada em `frontend/` com Angular.
- Possui um microsserviço de spam bot em `modules/service_spamChatBot/`.
- Possui um gateway mock em `modules/gateway/app.js`.

## Arquitetura atual, sem maquiagem

### Núcleo real da aplicação

O caminho principal está em `src/index.js` -> `src/services/app/bootstrapApp.js` -> serviços especializados. Esse é o fluxo que realmente manda na execução.

### Camadas que já existem de fato

- Inicialização e config: `src/services/settings/`
- Orquestração: `src/services/app/bootstrapApp.js`
- WebSocket: `src/services/websocket/`
- HTTP/Express: `src/services/webmanager/`
- Persistência: `src/services/dataBase/`
- Integrações externas: `src/services/externalConnections/`
- Logs: `src/services/app/logManager.js`
- UI: `frontend/`
- Serviços paralelos: `modules/`

### Ponto importante

O projeto ainda não está em uma clean architecture clássica. Ele está mais perto de uma arquitetura modular pragmática, com bastante acoplamento entre bootstrap, configuração e módulos concretos. Isso não é um problema por si só, mas significa que o próximo passo não deve ser “inventar camadas demais”. O melhor caminho aqui é simplificar e deixar as fronteiras mais explícitas.

## Principais funcionalidades observadas

### Funcionalidades centrais

- Comunicação em tempo real por WebSocket.
- Broadcast de mensagens para clientes conectados.
- Servidor HTTP para páginas e rotas auxiliares.
- Persistência local com SQLite.
- Logs diários em arquivo.
- Controle de ambiente dev/prod por configuração.
- Integração com Twitch via OAuth no Express.
- Centralização de mensagens e eventos de chat para posterior análise de dados.
- Base para consolidar sinais de múltiplas fontes de live em uma visão única para streamer.

### Funcionalidades auxiliares

- Gerador de spam para teste em desenvolvimento.
- Gateway mock para endpoints locais.
- Serviço separado de spam bot com fila, WebSocket e API própria.
- Frontend Angular para interface web.

## Problemas que hoje dificultam a evolução

- Ainda existem múltiplos pontos de entrada e serviços paralelos, o que continua diluindo a responsabilidade do núcleo.
- O `modules/` ainda contém serviços que não seguem o mesmo contrato do app principal, como o gateway mock e o spam bot, o que dificulta decidir o que é produto e o que é apoio.
- Alguns módulos de infraestrutura ainda misturam transporte, leitura de arquivo e regra de integração no mesmo arquivo, especialmente nas rotas HTTP e nos pontos de persistência.
- O sistema de log ainda está espalhado entre arquivos e funções utilitárias, sem uma interface única claramente aplicada em todo o projeto.
- Há dependências históricas e legadas que ainda convivem com o fluxo novo, então o risco maior agora é manter duas formas de fazer a mesma coisa.
- Falta um contrato explícito entre bootstrap, configurações e adaptadores, então qualquer nova feature pode voltar a acoplar tudo de novo.

## Arquitetura alvo: simples e clean

A meta não deve ser uma arquitetura “acadêmica”. O melhor ajuste aqui é um monólito modular com fronteiras limpas.

### Proposta simples

1. `app/` para bootstrap e composição.
2. `config/` para carregamento e validação de configuração.
3. `domain/` para regras puras e entidades simples.
4. `services/` para casos de uso e coordenação.
5. `adapters/` para Express, WebSocket, arquivo, SQLite, Twitch e qualquer integração externa.
6. `frontend/` continua separado e conversa com o backend por API/WebSocket.

### Regra prática

- O domínio não conhece Express, WebSocket, SQLite nem arquivos.
- Os casos de uso não sabem onde os dados são armazenados.
- Os adapters só traduzem entrada e saída.
- O bootstrap apenas monta dependências e liga o sistema.

## Próximos passos realistas e úteis

### Fase 1: estabilizar o núcleo

- Consolidar o fluxo de inicialização em um único caminho documentado e garantir que o bootstrap não chame serviços por efeito colateral.
- Completar o módulo de configuração com validação explícita, leitura única e escrita única para `config.json`.
- Criar um contrato simples para o bootstrap: o que ele recebe, o que ele inicializa e o que ele nunca deve conhecer diretamente.
- Definir, sem ambiguidade, quais módulos são parte do produto principal e quais são ferramentas de apoio ou legado.
- Registrar o produto como uma plataforma de centralização e análise de chat e eventos de live para streamer, para orientar decisões técnicas e de domínio.

### Fase 2: reduzir acoplamento

- Extrair a criação de servidores para fábricas pequenas e previsíveis, uma para HTTP e outra para WebSocket.
- Transformar `Express`, `WebSocket`, `SQLite` e acesso a arquivo em adaptadores que recebem dependências prontas.
- Eliminar os últimos leitores diretos de arquivo de configuração fora do carregador central.
- Remover dependências desnecessárias entre `src/` e `modules/` quando possível, começando pelos imports que ainda apontam para código legado.
- Separar claramente os pontos de captura de dados externos dos pontos de análise, para que a ingestão não fique misturada com a inteligência do produto.

### Fase 3: organizar por responsabilidade

- Mover regras de negócio para serviços pequenos e testáveis, deixando rotas e handlers só como tradutores de entrada e saída.
- Centralizar o broadcast, a fila de mensagens e o ciclo de vida de conexões em um serviço único.
- Padronizar nomes, idioma e estilo de arquivos para reduzir ruído e facilitar navegação.
- Tratar os módulos paralelos como produtos separados ou como adaptadores explícitos, nunca como um meio-termo invisível.
- Criar uma camada explícita de análise de dados para receber chat, eventos e metadados das lives sem acoplar essa lógica às rotas HTTP.

### Fase 4: aumentar confiabilidade

- Criar testes para carregamento de configuração, boot principal, rotas básicas e WebSocket.
- Validar o schema de configuração antes de subir a aplicação e antes de salvar alterações pela UI.
- Cobrir fallbacks críticos como banco, logs, OAuth e config backup.
- Adicionar checagens mínimas de saúde para os serviços principais e para os módulos paralelos mantidos.
- Validar que os dados capturados de chat e live cheguem íntegros até a camada de armazenamento e análise.

### Fase 5: decidir o destino dos módulos paralelos

- `modules/gateway/`: transformar em serviço separado real ou remover do bootstrap principal se continuar sendo só mock.
- `modules/service_spamChatBot/`: manter como microsserviço isolado com contrato próprio ou mover a lógica útil para uma camada interna.
- `modules/logger/`: alinhar com o sistema de log principal ou remover duplicação.
- Qualquer módulo que não tenha responsabilidade clara deve receber uma decisão explícita: integrar, isolar ou apagar.

### Fase 6: preparar a evolução da arquitetura

- Introduzir uma estrutura de pastas mais explícita sem quebrar o monólito modular atual.
- Separar contratos, adaptadores e serviços em pequenas etapas, sem reescrever tudo de uma vez.
- Criar documentação curta para cada serviço principal e para cada módulo paralelo mantido.
- Garantir que novas features entrem já no padrão de config, bootstrap e adapters, não no estilo antigo.
- Preparar o terreno para métricas e painéis analíticos voltados ao streamer, sem misturar coleta, persistência e visualização no mesmo lugar.

## Ordem recomendada de execução

1. Fechar a definição dos módulos paralelos e o que cada um representa.
2. Validar o carregador central de configuração em todos os pontos de entrada.
3. Padronizar o bootstrap principal e os adaptadores de servidor.
4. Isolar definitivamente acesso a arquivo, banco, WebSocket e integrações externas.
5. Cobrir os fluxos essenciais com testes automatizados.
6. Só depois disso vale crescer a arquitetura com novas camadas ou separar deploys distintos.

## Resumo objetivo

O projeto já tem funcionalidades úteis e uma base funcional, mas a melhor evolução aqui é reduzir dispersão e deixar a estrutura explícita. A recomendação é seguir com um monólito modular simples, com bootstrap único, config validada, serviços pequenos e adapters separados. Isso traz clean code sem exagerar na abstração.