import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

config();

console.log('Starting server initialization...');

const app = express();
const port = process.env.PORT || 4000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
});

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600 // Cache preflight requests for 10 minutes
}));
app.use(morgan('[:date[clf]] :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json());
// app.use(limiter);
app.use(cookieParser());

app.use('/api', router);

app.use(errorHandler);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});