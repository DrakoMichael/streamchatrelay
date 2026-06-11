class StatusResponseDTO {
  static create({ serviceStatus, transportStatus }) {
    return {
      status: serviceStatus.isRunning ? 'ativo' : 'parado',
      is_running: serviceStatus.isRunning,
      queue: transportStatus.rabbitmq.queue,
      rabbitmq: {
        url: transportStatus.rabbitmq.url,
        connected: transportStatus.rabbitmq.connected,
        retry_count: transportStatus.rabbitmq.retryCount
      },
      websocket: {
        enabled: transportStatus.websocket.enabled,
        connected: transportStatus.websocket.connected,
        port: transportStatus.websocket.port,
        clients: transportStatus.websocket.clients
      },
      sent_count: serviceStatus.sentCount,
      last_message_at: serviceStatus.lastMessageAt
    };
  }
}

export default StatusResponseDTO;