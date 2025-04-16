import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validateSchema(schema: ZodSchema): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                res.status(400).json({ errors: err.errors });
            } else {
                next(err as Error);
            }
        }
    };
}
