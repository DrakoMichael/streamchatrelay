import { Router } from 'express';

function createRoutes({ authMiddleware, spamController }) {
  const router = Router();

  router.get('/start', authMiddleware, async (req, res) => {
    return spamController.start(req, res);
  });

  router.post('/start', authMiddleware, async (req, res) => {
    return spamController.start(req, res);
  });

  router.get('/stop', authMiddleware, (req, res) => {
    return spamController.stop(req, res);
  });

  router.post('/stop', authMiddleware, (req, res) => {
    return spamController.stop(req, res);
  });

  router.get('/status', (req, res) => {
    return spamController.status(req, res);
  });

  return router;
}

export default createRoutes;
