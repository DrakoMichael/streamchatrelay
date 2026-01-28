import createLogService from "./server.js";

export default async function startLogService(port = 3002) {
    const app = createLogService();

    app.listen(port, () => {
        console.log(`Log service rodando na porta ${port}`);
    });
}