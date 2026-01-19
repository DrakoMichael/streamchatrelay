import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from 'marked';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

/**
 * @module src.services.webManager.express_bootstrap
 */

export default async function express_bootstrap(config) {
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

        app.use(express.static(path.join(__dirname, "../../public")));

        app.get('/', (_req, res) => {
            res.sendFile(path.join(__dirname, '../../public/index.html'));
        })

        app.use((_req, res, next) => {
            res.setHeader(
                "Content-Security-Policy",
                "default-src 'self'; connect-src 'self' ws:;"
            );
            next();
        });

        app.get('/help', (req, res) => {
            const md = fs.readFileSync('../src/help.md', 'utf-8');
            const html = marked(md);
            res.send(`<html><body>${html}</body></html>`);
        });

        app.get('/ajuda', async (_req, res) => {
            const md = fs.readFileSync('../src/help_BR.md', 'utf-8');
            const html = marked(md);
            res.send(`<html lang="pt-BR"><title>Ajuda PT BR</title><body>${html}</body></html>`);
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