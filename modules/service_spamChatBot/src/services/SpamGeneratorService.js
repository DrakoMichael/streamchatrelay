import fakeMessageData from '../../fakeMessageData.js';
import GeneratedMessageDTO from '../DTO/GeneratedMessageDTO.js';

class SpamGeneratorService {
  generateMessage() {
    const NAME_INDEX = Math.floor(Math.random() * fakeMessageData.nome.length);
    const PLATAFORM_INDEX = Math.floor(Math.random() * fakeMessageData.plataforms.length);
    const PHRASE_INDEX = Math.floor(Math.random() * fakeMessageData.frases.length);

    return GeneratedMessageDTO.create({
      plataforma: fakeMessageData.plataforms[PLATAFORM_INDEX],
      usuario: fakeMessageData.nome[NAME_INDEX],
      mensagem: fakeMessageData.frases[PHRASE_INDEX],
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

