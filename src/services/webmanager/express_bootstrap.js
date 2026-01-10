import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from 'marked';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

export default async function express_bootstrap(config) {
    try {
        const app = new express()
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

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
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

    } catch (error) {
        console.log(error);
    }
}; 