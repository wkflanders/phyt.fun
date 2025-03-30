export const corsOptions = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL ?? 'http://localhost:3000'
        ];
        // Allow requests with no origin (like mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 600, // Cache preflight requests for 10 minutes
    optionsSuccessStatus: 204 // Some legacy browsers (IE11) choke on 204
};
