import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateSchema =
    (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Get a single, user-friendly string with all messages
                const combinedErrorMessage = error.issues
                    .map((issue) => issue.message)
                    .join(', ');

                res.status(400).json({ error: combinedErrorMessage });
                return;
            }

            res.status(400).json({ error: 'Invalid request' });
            return;
        }
    };
