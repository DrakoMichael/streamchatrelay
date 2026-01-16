# Stream Chat Relay - Ajuda

## Resumo
Stream Chat Relay é uma ferramenta para gerenciar e retransmitir mensagens de chat em múltiplas plataformas de streaming.

## Começando
1. Clone o repositório
2. Instale as dependências: `npm install` - Isso irá baixar a pasta node_modules com todas as bibliotecas necessárias
3. Verifique o `config.json`, não altere o `config_backup.json` em `./etc`, este backup é usado apenas caso o `config.json` não funcione
4. Execute a aplicação: `npm start`

## Configuração
A aplicação utiliza `config.json` para suas configurações. Na inicialização, se algum valor estiver incorreto (null ou ausente), a aplicação usará `config_backup.json` como fallback.

O arquivo de configuração possui a seguinte estrutura:

```json
{
  "type_ambience": "dev",           // Tipo de ambiente (dev/prod)
  "use_webserver": true,            // Se o servidor web será iniciado
  "debbug": true,                   // Modo debug ativado
  "dev_config": {                   // Configurações do ambiente dev
    "dev_websocket_port": 8181,
    "dev_express_port": 3131,
    "enable_spam": true,            // Ativa gerador de mensagens para teste
    "connected_chat_notify": true,  // Notifica quando cliente(navegador) se conecta
    "print_spam_chats": false       // Printa todas as mensagens geradas
  },
  "database": {
    "enable_database": true,        // Ativa o módulo de banco de dados
    "enable_in_disk_db": true,      // Ativa armazenamento em disco
    "enable_in_memory_db": true,    // Ativa banco de dados em memória
    "indisk_db_name": "streamchatrelay_data"
  },
  "data_control": {
    "storage_messages_enabled": true,   // Ativa armazenamento de mensagens (log)
    "max_stored_messages": 200,         // Número máximo de mensagens no arquivo
    "message_cleanup_interval_ms": 5000 // Intervalo de limpeza dos arquivos
  },
  "data_analysis": {
    "enable_data_analysis": true,       // Ativa análise de dados
    "data_analysis_interval_ms": 6000   // Intervalo de análise em ms
  },
  "websocket_port": 8080,           // Porta do WebSocket (prod)
  "express_port": 3030              // Porta do servidor Express (prod)
}
```

## Uso
```bash
npm start       # Inicia o serviço de retransmissão
# npm run test    # Executa testes
# npm run build   # Compila para produção
```

## Solução de Problemas
- **Problemas de conexão**: Verifique as configurações e conectividade de rede
- **Mensagens não são retransmitidas**: Verifique o arquivo de log para erros
- **Desempenho**: Ajuste os intervalos em `data_analysis_interval_ms` ou reduza `max_stored_messages` se experiencing delays

## Suporte
Para problemas, crie um issue no GitHub ou entre em contato com os mantenedores.
