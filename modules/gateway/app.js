import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

const mockState = {
  service: 'gateway',
  version: '1.0.0',
  startedAt: new Date().toISOString()
};

function logRequest(req, _res, next) {
  console.log(`[gateway] ${req.method} ${req.originalUrl}`);
  next();
}

app.use(express.json());
app.use(logRequest);

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Gateway mockup is running locally',
    routes: ['/status', '/health', '/config']
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/status', (_req, res) => {
  res.json({
    ok: true,
    ...mockState
  });
});

app.get('/config', (_req, res) => {
  res.json({
    ok: true,
    port: PORT,
    mode: 'local-mockup'
  });
});

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found'
  });
});

app.use((error, _req, res, _next) => {
  console.error('[gateway] unexpected error:', error);
  res.status(500).json({
    ok: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Gateway mockup running on http://localhost:${PORT}`);
});

export default app;
