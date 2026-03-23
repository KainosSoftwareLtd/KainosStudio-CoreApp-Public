import { appLogger } from '../logConfig.js';
import { resolveFields } from '../services/fieldResolver.js';
import express from 'express';
import type { DataRetrievalRequest } from '../interfaces/types.js';

export function retrieveData(req: express.Request, res: express.Response): void {
  const body = req.body as DataRetrievalRequest;

  if (!body?.fields || !Array.isArray(body.fields)) {
    res.status(400).json({ error: '`fields` array is required' });
    return;
  }

  appLogger.info('Data retrieval request', {
    fieldCount: body.fields.length,
    fields: body.fields,
    userId: body.userId,
    hasSessionData: !!body.sessionData,
  });

  const response = resolveFields(body.fields, body.sessionData ?? {});

  appLogger.debug('Data retrieval response', { response });

  res.status(200).json(response);
}
