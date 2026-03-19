import fakeMessageData from '../../fakeMessageData.js';
import GeneratedMessageDTO from '../DTO/GeneratedMessageDTO.js';

class SpamGeneratorService {
  generateMessage() {
    const index = Math.floor(Math.random() * fakeMessageData.nome.length);

    return GeneratedMessageDTO.create({
      plataforma: fakeMessageData.plataforms[Math.floor(Math.random() * fakeMessageData.plataforms.length)],
      usuario: fakeMessageData.nome[index],
      mensagem: fakeMessageData.frases[index],
      timestamp: new Date().toISOString()
    });
  }

  formatMessage(message) {
    return `[${message.plataforma}] ${message.usuario}: ${message.mensagem}`;
  }

  toTransportPayload(message) {
    return GeneratedMessageDTO.toTransportPayload(message);
  }

  randomInterval(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }
}

export default SpamGeneratorService;