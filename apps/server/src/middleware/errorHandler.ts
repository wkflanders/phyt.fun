import { HttpError } from '@phyt/types';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    // Handle different error types
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            error: err.message,
            requestId: req.headers['x-request-id']
        });
    }

    // Handle NotFoundError from your types
    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: err.message,
            requestId: req.headers['x-request-id']
        });
    }

    // Handle ValidationError from your types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: err.message,
            requestId: req.headers['x-request-id']
        });
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
