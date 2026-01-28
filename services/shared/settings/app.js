import { createSettingsService } from "./server.js";

export default async function startSettingsService(port = 3001) {
    const app = createSettingsService();

    app.listen(port, () => {
        console.log(`Settings service rodando na porta ${port}`);
    });
}