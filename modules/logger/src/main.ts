import * as dotenv from "dotenv";
import { RabbitMqLogWorker } from "./workers/rabbitmqLogWorker.js";

// const envPath = process.argv[2];

// if (!envPath) {
//     throw new Error("Você precisa passar o caminho do .env");
// }

// dotenv.config({ path: envPath });

class Main {
    private readonly worker: RabbitMqLogWorker;

    constructor() {
        this.worker = new RabbitMqLogWorker({
            rabbitUrl: process.env.RABBITMQ_URL ?? "amqp://localhost:32768",
            queueName: process.env.RABBITMQ_LOG_QUEUE ?? "logs.queue",
            prefetch: Number(process.env.RABBITMQ_PREFETCH ?? 20),
            reconnectDelayMs: Number(process.env.RABBITMQ_RECONNECT_MS ?? 5000),
        });
    }

    async bootstrap() {
        this.attachShutdownHandlers();
        await this.worker.start();
    }

    private attachShutdownHandlers() {
        const shutdown = async (signal: string) => {
            console.log(`[logger-worker] Encerrando (${signal})...`);
            await this.worker.stop();
            process.exit(0);
        };

        process.on("SIGINT", () => void shutdown("SIGINT"));
        process.on("SIGTERM", () => void shutdown("SIGTERM"));
    }
}

const app = new Main();
app.bootstrap().catch((error: unknown) => {
    console.error("[logger-worker] Falha ao iniciar worker:", error);
    process.exit(1);
});