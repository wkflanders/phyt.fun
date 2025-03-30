import { User } from '@phyt/types';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            user?: User;
        }
    }
}