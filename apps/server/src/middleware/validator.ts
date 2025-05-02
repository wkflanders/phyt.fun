import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ZodType, ZodTypeDef } from 'zod';

type DTOSchema<T> = ZodType<T, ZodTypeDef, unknown>;

export function validateSchema<
    P extends ParamsDictionary = ParamsDictionary,
    B = unknown,
    Q = unknown
>(
    paramsSchema?: DTOSchema<P>,
    bodySchema?: DTOSchema<B>,
    querySchema?: DTOSchema<Q>
) {
    return (req: Request<P, any, B, Q>, res: Response, next: NextFunction) => {
        if (paramsSchema) {
            const parsedParams = paramsSchema.parse(req.params);
            req.params = parsedParams;
        }

        if (bodySchema) {
            const parsedBody = bodySchema.parse(req.body);
            req.body = parsedBody;
        }

        if (querySchema) {
            const parsedQuery = querySchema.parse(req.query);
            req.query = parsedQuery;
        }

        next();
    };
}
