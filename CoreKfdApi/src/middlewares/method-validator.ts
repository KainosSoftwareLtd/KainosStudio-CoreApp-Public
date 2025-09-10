import express from 'express';

const allowedMethods = ['PUT', 'DELETE'];

export function methodValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ message: `Method Not Allowed. HTTP method ${req.method} is not allowed` });
  }
  next();
}
