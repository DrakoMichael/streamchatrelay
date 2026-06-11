import { z } from 'zod';

const startSpamSchema = z
  .object({
    dev_config: z
      .object({
        enable_spam: z.boolean().default(true),
        print_spam_chats: z.boolean().default(true)
      })
      .default({}),
    interval: z
      .object({
        minMs: z.number().int().nonnegative().default(0),
        maxMs: z.number().int().nonnegative().default(500)
      })
      .default({}),
    transports: z
      .object({
        rabbitmq: z.boolean().default(true),
        websocket: z.boolean().default(true)
      })
      .default({})
  })
  .default({})
  .refine((data) => data.interval.maxMs >= data.interval.minMs, {
    path: ['interval', 'maxMs'],
    message: 'interval.maxMs deve ser maior ou igual a interval.minMs'
  })
  .transform((data) => {
    const minMs = data.interval.minMs;
    const maxMs = data.interval.maxMs;

    return {
      dev_config: {
        enable_spam: data.dev_config.enable_spam,
        print_spam_chats: data.dev_config.print_spam_chats
      },
      interval: {
        minMs,
        maxMs
      },
      transports: {
        rabbitmq: data.transports.rabbitmq,
        websocket: data.transports.websocket
      }
    };
  });

class StartSpamDTO {
  static parse(input = {}) {
    return startSpamSchema.parse(input);
  }

  static safeParse(input = {}) {
    return startSpamSchema.safeParse(input);
  }
}

export default StartSpamDTO;