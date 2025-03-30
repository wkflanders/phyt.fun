import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import router from './routes';

config();

// console.log('Starting server initialization...');
// will need real logging

const app = express();
const port = process.env.SERVER_PORT ?? 4000;

// need to add rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
// });

app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 600 // Cache preflight requests for 10 minutes
    })
);
app.use(
    morgan(
        '[:date[clf]] :method :url :status :response-time ms - :res[content-length]'
    )
);
app.use(express.json());
// app.use(limiter);
app.use(cookieParser());

app.use('/api', router);

app.use(errorHandler);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
    // console.log(`Server running on port ${port}`);
    // add logging
});
