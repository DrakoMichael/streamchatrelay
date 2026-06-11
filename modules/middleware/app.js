import express from 'express';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

const mockMessages = [];

app.use(express.json());

app.use((req, _res, next) => {
	const startedAt = Date.now();

	req.on('close', () => {
		const elapsedMs = Date.now() - startedAt;
		console.log(`[middleware] ${req.method} ${req.originalUrl} (${elapsedMs}ms)`);
	});

	next();
});

app.get('/health', (_req, res) => {
	res.json({
		ok: true,
		service: 'middleware-mockup',
		message: 'Express middleware service is running'
	});
});

app.get('/mockup', (_req, res) => {
	res.json({
		name: 'middleware-mockup',
		version: '1.0.0',
		routes: [
			'GET /health',
			'GET /mockup',
			'GET /api/messages',
			'POST /api/messages'
		]
	});
});

app.get('/api/messages', (_req, res) => {
	res.json({
		total: mockMessages.length,
		items: mockMessages
	});
});

app.post('/api/messages', (req, res) => {
	const payload = req.body ?? {};
	const message = {
		id: mockMessages.length + 1,
		channel: payload.channel || 'general',
		author: payload.author || 'mock-user',
		text: payload.text || 'Mensagem de mock adicionada com sucesso.',
		createdAt: new Date().toISOString()
	};

	mockMessages.push(message);

	res.status(201).json({
		ok: true,
		message
	});
});

app.use((_req, res) => {
	res.status(404).json({
		ok: false,
		error: 'Route not found in middleware mockup'
	});
});

app.use((error, _req, res, _next) => {
	console.error('[middleware] unexpected error:', error);
	res.status(500).json({
		ok: false,
		error: 'Internal server error'
	});
});

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
	app.listen(PORT, () => {
		console.log(`Middleware mockup running on http://localhost:${PORT}`);
	});
}

export default app;