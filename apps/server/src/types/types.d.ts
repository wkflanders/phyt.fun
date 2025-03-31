declare global {
    namespace Express {
        interface Request {
            auth?: {
                privy_id: string;
            };
        }
    }
}

export {};
