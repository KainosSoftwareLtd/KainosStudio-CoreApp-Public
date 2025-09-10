import express from 'express';

export function permissionsPolicy() {
  return function permissionsPolicy(_req: express.Request, res: express.Response, next: express.NextFunction) {
    res.setHeader('Permissions-Policy', 'bluetooth=(), camera=(), geolocation=(), microphone=(), payment=()');
    next();
  };
}
