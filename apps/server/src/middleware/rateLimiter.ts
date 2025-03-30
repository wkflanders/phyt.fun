import { NextFunction, Request, Response } from 'express';
import rateLimit, { Options } from 'express-rate-limit';

export const standardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.',
    handler: (
        req: Request,
        res: Response,
        next: NextFunction,
        options: Options
    ) => {
        res.status(429).json({
            error: 'Too many requests, please try again later.',
            retryAfter: Math.ceil(options.windowMs / 1000 / 60) // in minutes
        });
    }
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 auth requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    handler: (
        req: Request,
        res: Response,
        next: NextFunction,
        options: Options
    ) => {
        res.status(429).json({
            error: 'Too many authentication attempts, please try again later.',
            retryAfter: Math.ceil(options.windowMs / 1000 / 60) // in minutes
        });
    }
});
