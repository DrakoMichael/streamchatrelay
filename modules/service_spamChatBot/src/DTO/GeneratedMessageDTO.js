class GeneratedMessageDTO {
  static create(rawMessage) {
    return {
      plataforma: rawMessage.plataforma,
      usuario: rawMessage.usuario,
      mensagem: rawMessage.mensagem,
      timestamp: rawMessage.timestamp || new Date().toISOString()
    };
  }

  static toTransportPayload(message) {
    const formatted = `[${message.plataforma}] ${message.usuario}: ${message.mensagem}`;
    return {
      formatted,
      data: message
    };
  }
}

export default GeneratedMessageDTO;