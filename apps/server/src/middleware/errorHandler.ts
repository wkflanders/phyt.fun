import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';

import {
    NotFoundError,
    ValidationError,
    DuplicateError,
    AuthenticationError,
    PermissionError,
    DatabaseError,
    PackPurchaseError,
    MarketplaceError
} from '@phyt/models';

import { env } from '@/env.js';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Coerce X-Request-Id to a plain string
    const requestId = String(req.headers['x-request-id'] ?? '');

    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof AuthenticationError) {
        res.status(401).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof DuplicateError) {
        res.status(422).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof NotFoundError) {
        res.status(404).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof ValidationError) {
        res.status(400).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof PermissionError) {
        res.status(403).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof DatabaseError) {
        res.status(512).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof PackPurchaseError) {
        res.status(500).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof MarketplaceError) {
        res.status(500).json({
            error: err.message,
            requestId
        });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            error: err.message,
            requestId
        });
        return;
    }

    // Default error handler
    res.status(500).json({
        error:
            env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
        requestId
    });
};
