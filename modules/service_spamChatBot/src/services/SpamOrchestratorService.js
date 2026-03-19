class SpamOrchestratorService {
  constructor({ generatorService, transportRepository }) {
    this.generatorService = generatorService;
    this.transportRepository = transportRepository;
    this.loopTimer = null;
    this.running = false;
    this.sentCount = 0;
    this.lastMessageAt = null;
    this.currentConfig = null;
  }

  async start(config) {
    if (this.running) {
      this.stop();
    }

    this.currentConfig = config;

    if (!config.dev_config.enable_spam) {
      return {
        started: false,
        reason: 'enable_spam=false'
      };
    }

    this.running = true;
    this.runLoop();

    return {
      started: true
    };
  }

  stop() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    this.running = false;
    return { stopped: true };
  }

  runLoop() {
    if (!this.running || !this.currentConfig) {
      return;
    }

    const message = this.generatorService.generateMessage();
    const payload = this.generatorService.toTransportPayload(message);

    if (this.currentConfig.dev_config.print_spam_chats) {
      console.log(payload.formatted);
    }

    const sent = this.transportRepository.send(payload, this.currentConfig.transports);

    if (sent.rabbitmq || sent.websocket) {
      this.sentCount += 1;
      this.lastMessageAt = message.timestamp;
    }

    const nextDelay = this.generatorService.randomInterval(
      this.currentConfig.interval.minMs,
      this.currentConfig.interval.maxMs
    );

    this.loopTimer = setTimeout(() => this.runLoop(), nextDelay);
  }

  getStatus() {
    return {
      isRunning: this.running,
      sentCount: this.sentCount,
      lastMessageAt: this.lastMessageAt,
      currentConfig: this.currentConfig
    };
  }
}

export default SpamOrchestratorService;