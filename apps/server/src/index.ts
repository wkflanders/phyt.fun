import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { userRouter } from './routes/users';
import { errorHandler } from './middleware/errorHandler';

config();

const app = express();
const port = process.env.PORT || 4000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/users', userRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});