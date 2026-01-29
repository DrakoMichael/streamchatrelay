import createSpamGeneratorService from "./src/services/express/server.js";

export default async function startSpamGeneratorService(port = 3003) {
    const app = createSpamGeneratorService();

    app.listen(port, () => {
        console.log(`Spam Generator service rodando na porta ${port}`);
    });
}