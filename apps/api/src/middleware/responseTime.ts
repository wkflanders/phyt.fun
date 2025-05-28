import { Request, Response, NextFunction } from 'express';

export const responseTimeMonitor = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        // eslint-disable-next-line no-console
        console.log(
            `${req.method} ${req.originalUrl} completed in ${time.toFixed(2)}ms`
        );
        if (time > 1000) {
            console.warn(
                `Slow request detected: ${req.method} ${req.originalUrl} took ${time.toFixed(2)}ms`
            );
        }
    });

    next();
};
