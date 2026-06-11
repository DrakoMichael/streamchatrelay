import type { Channel, ChannelModel, ConsumeMessage } from "amqplib";
import { connect } from "amqplib";

type RabbitMqLogWorkerConfig = {
    rabbitUrl: string;
    queueName: string;
    prefetch: number;
    reconnectDelayMs: number;
};

export class RabbitMqLogWorker {
    private readonly rabbitUrl: string;
    private readonly queueName: string;
    private readonly prefetch: number;
    private readonly reconnectDelayMs: number;

    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private isStopping = false;
    private reconnectTimer: NodeJS.Timeout | null = null;

    constructor(config: RabbitMqLogWorkerConfig) {
        this.rabbitUrl = config.rabbitUrl;
        this.queueName = config.queueName;
        this.prefetch = Number.isNaN(config.prefetch) ? 20 : config.prefetch;
        this.reconnectDelayMs = Number.isNaN(config.reconnectDelayMs) ? 5000 : config.reconnectDelayMs;
    }

    async start(): Promise<void> {
        this.isStopping = false;
        await this.connectAndConsume();
    }

    async stop(): Promise<void> {
        this.isStopping = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.channel) {
            await this.channel.close().catch(() => undefined);
            this.channel = null;
        }

        if (this.connection) {
            await this.connection.close().catch(() => undefined);
            this.connection = null;
        }
    }

    private async connectAndConsume(): Promise<void> {
        try {
            this.connection = await connect(this.rabbitUrl);
            this.connection.on("close", () => this.handleConnectionDrop("Conexao RabbitMQ fechada"));
            this.connection.on("error", (error) => {
                if (!this.isStopping) {
                    console.error("[logger-worker] Erro na conexao RabbitMQ:", error);
                }
            });

            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            await this.channel.prefetch(this.prefetch);

            await this.channel.consume(
                this.queueName,
                (message) => this.handleMessage(message),
                { noAck: false },
            );

            console.log(`[logger-worker] Monitorando fila '${this.queueName}' em ${this.rabbitUrl}`);
        } catch (error) {
            console.error("[logger-worker] Nao foi possivel conectar no RabbitMQ:", error);
            this.scheduleReconnect();
        }
    }

    private handleMessage(message: ConsumeMessage | null): void {
        if (!message || !this.channel) {
            return;
        }

        try {
            const payload = message.content.toString("utf-8");
            console.log(`[log-queue:${this.queueName}] ${payload}`);
            this.channel.ack(message);
        } catch (error) {
            console.error("[logger-worker] Falha ao processar mensagem:", error);
            this.channel.nack(message, false, true);
        }
    }

    private handleConnectionDrop(reason: string): void {
        if (this.isStopping) {
            return;
        }

        console.warn(`[logger-worker] ${reason}. Tentando reconectar...`);
        this.channel = null;
        this.connection = null;
        this.scheduleReconnect();
    }

    private scheduleReconnect(): void {
        if (this.isStopping || this.reconnectTimer) {
            return;
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.connectAndConsume();
        }, this.reconnectDelayMs);
    }
}
