import { Request, Response, NextFunction } from 'express';
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    req.headers['x-request-id'] ??= crypto.randomUUID();
    // Add request ID to response headers for client tracking
    res.setHeader('x-request-id', req.headers['x-request-id']);
    next();
};
