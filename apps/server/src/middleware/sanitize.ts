import { Request, Response, NextFunction } from 'express';

type SanitizableValue = string | number | boolean | null | undefined;
interface SanitizableObject {
    [key: string]:
        | SanitizableValue
        | SanitizableObject
        | (SanitizableValue | SanitizableObject)[];
}

export const sanitizeInputs = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.body) {
        sanitizeRequestObject(req.body);
    }

    if (Object.keys(req.query).length > 0) {
        sanitizeRequestObject(req.query as SanitizableObject);
    }

    if (Object.keys(req.params).length > 0) {
        sanitizeRequestObject(req.query as SanitizableObject);
    }

    next();
};

function sanitizeRequestObject<T extends SanitizableObject>(obj: T): T {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            // Basic sanitization: HTML encode and trim
            obj[key] = obj[key]
                .trim()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;') as T[Extract<keyof T, string>];
        } else if (Array.isArray(obj[key])) {
            // Handle arrays
            const arr = obj[key];
            arr.forEach((item, index) => {
                if (typeof item === 'string') {
                    arr[index] = item
                        .trim()
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;') as SanitizableValue;
                } else if (typeof item === 'object' && item !== null) {
                    sanitizeRequestObject(item as SanitizableObject);
                }
            });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively sanitize nested objects
            sanitizeRequestObject(obj[key]);
        }
    }
    return obj;
}
