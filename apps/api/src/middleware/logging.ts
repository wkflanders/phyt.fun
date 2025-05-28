import { Request, Response, NextFunction } from 'express';

import crypto from 'node:crypto';

import morgan from 'morgan';

morgan.token('request-id', (req: Request) => {
    return (req.headers['x-request-id'] as string) || '';
});

export const logFormat =
    '[:date[iso]] [REQUEST_ID::request-id] :method :url :status :response-time ms - :res[content-length]';

export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Add request ID to response headers for client tracking
    req.headers['x-request-id'] ??= crypto.randomUUID();
    res.setHeader('x-request-id', req.headers['x-request-id']);
    next();
};
