import express from 'express';

export function contentTypeValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (contentType && !contentType.startsWith('application/json')) {
      return res.status(415).json({ message: 'Unsupported Media Type. Content-Type must be application/json' });
    }
  }

  next();
}
