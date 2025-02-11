import { User } from '@phyt/types';

declare global {
    namespace Express {
        interface Request {
            body: {
                user?: User;
                [key: string]: any;
            };
        }
    }
}