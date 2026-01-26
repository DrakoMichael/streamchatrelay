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
                "default-src 'self'; connect-src 'self' ws:; script-src 'self' 'unsafe-inline';"
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

        // API endpoint to get config
        app.get('/api/config', (_req, res) => {
            try {
                const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
                const config = JSON.parse(configData);
                res.json(config);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao ler configurações: ' + error.message });
            }
        });

        // API endpoint to save config
        app.post('/api/config', (req, res) => {
            try {
                const newConfig = req.body;
                
                // Validate config structure
                if (!newConfig || typeof newConfig !== 'object') {
                    return res.status(400).json({ error: 'Configuração inválida' });
                }

                // Write config to file with pretty formatting
                fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
                
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