import { HttpError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    if (res.headersSent) {
        next(err);
        return;
    }

    // Handle different error types
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            error: err.message,
            requestId: req.headers['x-request-id']
        });
        return;
    }

    // Handle NotFoundError from your types
    if (err.name === 'NotFoundError') {
        res.status(404).json({
            error: err.message,
            requestId: req.headers['x-request-id']
        });
        return;
    }

    // Handle ValidationError from your types
    if (err.name === 'ValidationError') {
        res.status(400).json({
            error: err.message,
            requestId: req.headers['x-request-id']
        });
        return;
    }

    // Default error handler
    res.status(500).json({
        error:
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
        requestId: req.headers['x-request-id']
    });
};
