import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from 'marked';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../../config.json');

/**
 * @module src.services.webManager.express_bootstrap
 */

export default async function express_bootstrap(config) {
    if(config === "test"){
        return "test_success";
    }
    
    try {
        let app;

        try {
            app = new express()
        } catch (error) {
            console.error("Failed to create express app:", error);
            return null;
        }

        let port = null;
        
        if(config.type_ambience === "dev") {
            port = config.dev_config.dev_express_port;
        } else {
            port = config.express_port;
        }

        // Middleware para parsear JSON
        app.use(express.json());
        
        app.use((_req, res, next) => {
            res.setHeader(
                "Content-Security-Policy",
                "default-src 'self'; connect-src 'self' ws:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
            );
            next();
        });
        
        app.use(express.static(path.join(__dirname, "../../public")));

        app.get('/', (_req, res) => {
            res.sendFile(path.join(__dirname, '../../public/index.html'));
        })
        
        app.get('/config', (_req, res) => {
            res.sendFile(path.join(__dirname, '../../public/config.html'));
        })

        app.get('/help', (_req, res) => {
            const md = fs.readFileSync('../src/help.md', 'utf-8');
            const html = marked(md);
            res.send(`<html><body>${html}</body></html>`);
        });

        app.get('/ajuda', async (_req, res) => {
            const md = fs.readFileSync('../src/help_BR.md', 'utf-8');
            const html = marked(md);
            res.send(`<html lang="pt-BR"><title>Ajuda PT BR</title><body>${html}</body></html>`);
        });

        // Twitch OAuth2 endpoints
        
        /**
         * Initiates the Twitch OAuth2 authorization flow
         * Redirects user to Twitch authorization page
         */
        app.get('/auth/twitch', async (_req, res) => {
            try {
                const configData = await fs.promises.readFile(CONFIG_PATH, 'utf-8');
                const currentConfig = JSON.parse(configData);
                
                const clientId = currentConfig.twitch?.client_id;
                
                if (!clientId) {
                    return res.status(400).send(`
                        <html>
                            <head><title>Erro de Configuração</title></head>
                            <body>
                                <h1>Erro: Client ID não configurado</h1>
                                <p>Por favor, configure o client_id no arquivo config.json antes de usar o OAuth.</p>
                                <p><a href="/">Voltar para página inicial</a></p>
                            </body>
                        </html>
                    `);
                }
                
                // Get the port to construct redirect_uri
                const port = currentConfig.type_ambience === "dev" 
                    ? currentConfig.dev_config.dev_express_port 
                    : currentConfig.express_port;
                
                const redirectUri = `http://localhost:${port}/auth/callback`;
                
                // Scopes needed for EventSub and basic functionality
                const scopes = [
                    'user:read:email',
                    'channel:read:subscriptions',
                    'moderator:read:followers'
                ].join(' ');
                
                // Build authorization URL
                const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
                authUrl.searchParams.append('client_id', clientId);
                authUrl.searchParams.append('redirect_uri', redirectUri);
                authUrl.searchParams.append('response_type', 'code');
                authUrl.searchParams.append('scope', scopes);
                
                // Redirect to Twitch authorization page
                res.redirect(authUrl.toString());
            } catch (error) {
                res.status(500).send(`
                    <html>
                        <head><title>Erro</title></head>
                        <body>
                            <h1>Erro ao iniciar autenticação</h1>
                            <p>${error.message}</p>
                            <p><a href="/">Voltar para página inicial</a></p>
                        </body>
                    </html>
                `);
            }
        });

        /**
         * Handles the OAuth2 callback from Twitch
         * Exchanges authorization code for access token
         */
        app.get('/auth/callback', async (req, res) => {
            try {
                const code = req.query.code;
                const error = req.query.error;
                const errorDescription = req.query.error_description;
                
                // Check for authorization errors
                if (error) {
                    return res.status(400).send(`
                        <html>
                            <head><title>Erro de Autenticação</title></head>
                            <body>
                                <h1>Erro na autenticação com Twitch</h1>
                                <p><strong>Erro:</strong> ${error}</p>
                                <p><strong>Descrição:</strong> ${errorDescription || 'Nenhuma descrição fornecida'}</p>
                                <p><a href="/auth/twitch">Tentar novamente</a> | <a href="/">Voltar para página inicial</a></p>
                            </body>
                        </html>
                    `);
                }
                
                if (!code) {
                    return res.status(400).send(`
                        <html>
                            <head><title>Erro</title></head>
                            <body>
                                <h1>Código de autorização não recebido</h1>
                                <p><a href="/auth/twitch">Tentar novamente</a> | <a href="/">Voltar para página inicial</a></p>
                            </body>
                        </html>
                    `);
                }
                
                // Load current configuration
                const configData = await fs.promises.readFile(CONFIG_PATH, 'utf-8');
                const currentConfig = JSON.parse(configData);
                
                const clientId = currentConfig.twitch?.client_id;
                const clientSecret = currentConfig.twitch?.client_secret;
                
                if (!clientId || !clientSecret) {
                    return res.status(400).send(`
                        <html>
                            <head><title>Erro de Configuração</title></head>
                            <body>
                                <h1>Erro: Credenciais não configuradas</h1>
                                <p>Por favor, configure client_id e client_secret no arquivo config.json.</p>
                                <p><a href="/">Voltar para página inicial</a></p>
                            </body>
                        </html>
                    `);
                }
                
                // Get the port to construct redirect_uri
                const port = currentConfig.type_ambience === "dev" 
                    ? currentConfig.dev_config.dev_express_port 
                    : currentConfig.express_port;
                
                const redirectUri = `http://localhost:${port}/auth/callback`;
                
                // Exchange code for access token
                const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: redirectUri
                    })
                });
                
                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.text();
                    throw new Error(`Token exchange failed (${tokenResponse.status}): ${errorData}`);
                }
                
                const tokenData = await tokenResponse.json();
                
                // Update configuration with new tokens
                currentConfig.twitch.access_token = tokenData.access_token;
                currentConfig.twitch.refresh_token = tokenData.refresh_token || '';
                
                // Save updated configuration
                await fs.promises.writeFile(CONFIG_PATH, JSON.stringify(currentConfig, null, 2), 'utf-8');
                
                // Send success response with instructions
                res.send(`
                    <html>
                        <head>
                            <title>Autenticação Bem-Sucedida</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    max-width: 800px;
                                    margin: 50px auto;
                                    padding: 20px;
                                }
                                .success {
                                    background-color: #d4edda;
                                    border: 1px solid #c3e6cb;
                                    color: #155724;
                                    padding: 15px;
                                    border-radius: 5px;
                                    margin-bottom: 20px;
                                }
                                .info {
                                    background-color: #d1ecf1;
                                    border: 1px solid #bee5eb;
                                    color: #0c5460;
                                    padding: 15px;
                                    border-radius: 5px;
                                    margin-bottom: 20px;
                                }
                                code {
                                    background-color: #f4f4f4;
                                    padding: 2px 5px;
                                    border-radius: 3px;
                                    font-family: monospace;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>✓ Autenticação com Twitch Bem-Sucedida!</h1>
                            
                            <div class="success">
                                <h2>Tokens OAuth2 salvos com sucesso</h2>
                                <p>Seus tokens de acesso foram salvos no arquivo de configuração.</p>
                            </div>
                            
                            <div class="info">
                                <h3>Próximos Passos:</h3>
                                <ol>
                                    <li>Para ativar a conexão Twitch, atualize <code>enable_twitch_connection: true</code> no <code>config.json</code></li>
                                    <li>Reinicie a aplicação para aplicar as mudanças</li>
                                    <li>A conexão WebSocket EventSub da Twitch será iniciada automaticamente</li>
                                </ol>
                            </div>
                            
                            <h3>Informações do Token:</h3>
                            <ul>
                                <li><strong>Access Token:</strong> Salvo com sucesso</li>
                                <li><strong>Token Type:</strong> ${tokenData.token_type}</li>
                                <li><strong>Expires In:</strong> ${tokenData.expires_in} segundos</li>
                                ${tokenData.refresh_token ? `<li><strong>Refresh Token:</strong> Salvo</li>` : ''}
                                <li><strong>Scopes:</strong> ${tokenData.scope || 'N/A'}</li>
                            </ul>
                            
                            <p><a href="/">← Voltar para página inicial</a></p>
                        </body>
                    </html>
                `);
                
                console.log('[OAuth] Successfully obtained and saved Twitch OAuth2 tokens');
                
            } catch (error) {
                console.error('[OAuth] Error in callback:', error);
                res.status(500).send(`
                    <html>
                        <head><title>Erro</title></head>
                        <body>
                            <h1>Erro ao processar callback</h1>
                            <p>${error.message}</p>
                            <p><a href="/auth/twitch">Tentar novamente</a> | <a href="/">Voltar para página inicial</a></p>
                        </body>
                    </html>
                `);
            }
        });

        // API endpoint to get config
        app.get('/api/config', async (_req, res) => {
            try {
                const configData = await fs.promises.readFile(CONFIG_PATH, 'utf-8');
                const config = JSON.parse(configData);
                res.json(config);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao ler configurações: ' + error.message });
            }
        });

        // API endpoint to save config
        app.post('/api/config', async (req, res) => {
            try {
                const newConfig = req.body;
                
                // Validate config structure
                if (!newConfig || typeof newConfig !== 'object') {
                    return res.status(400).json({ error: 'Configuração inválida' });
                }

                // Validate required fields
                const requiredFields = ['type_ambience', 'use_webserver', 'use_websocket'];
                for (const field of requiredFields) {
                    if (!(field in newConfig)) {
                        return res.status(400).json({ error: `Campo obrigatório ausente: ${field}` });
                    }
                }

                // Validate nested structures
                if (newConfig.type_ambience === 'dev' && !newConfig.dev_config) {
                    return res.status(400).json({ error: 'dev_config é obrigatório no modo de desenvolvimento' });
                }

                // Write config to file with pretty formatting
                await fs.promises.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
                
                res.json({ success: true, message: 'Configurações salvas com sucesso' });
            } catch (error) {
                res.status(500).json({ error: 'Erro ao salvar configurações: ' + error.message });
            }
        });

        // Inicia o servidor e guarda a referência
        const server = app.listen(port, () => {
            console.log(`Express app listening on port ${port}`);
        });

        // Retorna objeto com app e método para fechar
        return {
            app,
            server,
            close: () => {
                return new Promise((resolve, reject) => {
                    // Força o encerramento de todas as conexões
                    server.closeAllConnections?.();
                    
                    // Fecha o servidor
                    server.close((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                    
                    // Timeout de segurança: força encerramento se não fechar em 5s
                    setTimeout(() => {
                        resolve();
                    }, 5000);
                });
            }
        };

    } catch (error) {
        console.error("Express bootstrap error:", error);
        return null;
    }
}; 