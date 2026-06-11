function extractToken(req) {
  const headerToken = req.headers['x-api-key'];
  const authHeader = req.headers.authorization || '';

  if (headerToken) {
    return headerToken;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

function createAuthMiddleware(apiToken) {
  return function authMiddleware(req, res, next) {
    const token = extractToken(req);

    if (!token || token !== apiToken) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    return next();
  };
}

export default createAuthMiddleware;