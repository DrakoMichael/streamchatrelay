function createEmptySummary() {
  return {
    totalMessages: 0,
    bySender: {},
    byOrigin: {},
    byType: {},
    lastMessageAt: null,
    lastMessagePreview: null
  };
}

class MessageAnalysis {
  constructor() {
    this.summary = createEmptySummary();
  }

  normalizeMessage(message) {
    if (typeof message === 'string') {
      return {
        content: message,
        sender: 'unknown',
        origin: 'unknown',
        type: 'text',
        timestamp: Date.now()
      };
    }

    if (!message || typeof message !== 'object') {
      return {
        content: String(message ?? ''),
        sender: 'unknown',
        origin: 'unknown',
        type: 'text',
        timestamp: Date.now()
      };
    }

    return {
      id: message.id || crypto.randomUUID(),
      sender: message.sender || message.usuario || 'unknown',
      content: message.content || message.mensagem || message.text || '',
      origin: message.origin || message.plataforma || 'unknown',
      type: message.type || 'text',
      timestamp: message.timestamp || Date.now(),
      raw: message
    };
  }

  register(message) {
    const normalizedMessage = this.normalizeMessage(message);

    this.summary.totalMessages += 1;
    this.summary.bySender[normalizedMessage.sender] = (this.summary.bySender[normalizedMessage.sender] || 0) + 1;
    this.summary.byOrigin[normalizedMessage.origin] = (this.summary.byOrigin[normalizedMessage.origin] || 0) + 1;
    this.summary.byType[normalizedMessage.type] = (this.summary.byType[normalizedMessage.type] || 0) + 1;
    this.summary.lastMessageAt = new Date().toISOString();
    this.summary.lastMessagePreview = normalizedMessage.content.slice(0, 120);

    return normalizedMessage;
  }

  getSummary() {
    return {
      ...this.summary,
      topSenders: Object.entries(this.summary.bySender)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      topOrigins: Object.entries(this.summary.byOrigin)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    };
  }

  reset() {
    this.summary = createEmptySummary();
  }
}

const messageAnalysis = new MessageAnalysis();

export default messageAnalysis;