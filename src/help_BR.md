# Stream Chat Relay - Ajuda

## Resumo
Stream Chat Relay é uma ferramenta para gerenciar e organizar chats de mensagens entre multiplas plataformas, você pode modificar para outros tipos de dados.

## Básico da aplicação
1. Clone a aplicação para sua máquina
2. Instale as dependências usando Node Package Manager: `npm install` -  Será criado uma pasta node_modules contendo todos as bibliotecas de terceiros.
3. Configure `config.json` em `./src`. Modifique `config_backup.json` em `./src/etc` apenas se você quiser um arquivo de Backup modificado, caso contrário já existem valores padrões.
4. Inicie a aplicação: `npm start` - mensagens de alertas de inicialização ou conexão durante a execução são configurados no `config.json`. 
<!-- ?. Configure your API keys in `.env` -->

## Configurando e valores padrões de `config_backup.json`
A aplicação no momento de sua inicialização irá checar seus parâmetros definidos em `config.json` na pasta `./src`, caso algum valor incorreto (null ou ausente) irá ser chamado uma excessão sem interroper a execução da aplicação utilizando `config_backup.json`, você pode editar previamente esses parâmetros ou deixar os valores padrões. 
O arquivo de configuração possui a seguinte estrutura com suas respectivas ações:

```json
{       // true-false / int
  "type_ambience": "dev",           //tipo de ambiente (dev/prod) - "prod" por padrão se for diferente de "dev"
  "use_webserver": true,            //se será iniciado o servidor web (pode consumir processamento)
  "dev_config": {                   //conf de ambient dev - somente se type_ambience: dev
    "dev_websocket_port" : 8181,
    "dev_express_port" : 3131,
    "enable_spam": true,            //ativa o gerador de mensagens para teste (pode consumir processamento)
    "connected_chat_notify": true,  //printa no console se algum cliente(navegador) se conectou
    "print_spam_chats": false       //printa no console TODAS as mensagens geradas pelo gerador
  },
  "data_analysis": {                //conf de análise de dados
    "enable_data_analysis": false,  //ativa ou desativa o módulo de análise de dados (pode consumir processamento e memória)
    "data_analysis_interval_ms": 60000  //sera o valor em ms do intervalo em que sera capturado e armazenado dos dados
  },
  "websocket_port": 8080,           //confs do ambiente padrão - prod -
  "express_port": 3030
}
```

<!-- ## Usage
```bash
npm start       # Start the relay service
# npm run test    # Run tests
# npm run build   # Build for production
``` -->
<!-- 
## Troubleshooting
- **Connection issues**: Verify API keys and network connectivity
- **Messages not relaying**: Check the log file for errors
- **Performance**: Adjust `RELAY_TIMEOUT` if experiencing delays

## Support
For issues, create a GitHub issue or contact the maintainers. -->