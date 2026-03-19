import StatusResponseDTO from '../DTO/StatusResponseDTO.js';

class SpamController {
  constructor({ spamService, startSpamDTO, transportRepository }) {
    this.spamService = spamService;
    this.startSpamDTO = startSpamDTO;
    this.transportRepository = transportRepository;
  }

  start = async (req, res) => {
    const parsedConfig = this.startSpamDTO.safeParse(req.body || {});

    if (!parsedConfig.success) {
      const details = parsedConfig.error.issues.map((item) => ({
        path: item.path.join('.'),
        message: item.message
      }));
      return res.status(400).json({
        error: 'Payload inválido',
        details
      });
    }

    const result = await this.spamService.start(parsedConfig.data);
    return res.json({
      status: result.started ? 'Spam iniciado' : 'Spam não iniciado',
      reason: result.reason || null
    });
  };

  stop = async (req, res) => {
    this.spamService.stop();
    return res.json({ status: 'Spam parado' });
  };

  status = async (req, res) => {
    const serviceStatus = this.spamService.getStatus();
    const transportStatus = this.transportRepository.getStatus();

    return res.json(
      StatusResponseDTO.create({
        serviceStatus,
        transportStatus
      })
    );
  };
}

export default SpamController;