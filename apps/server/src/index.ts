import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './middleware/CORS';
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware, logFormat } from './middleware/logging';
import { standardLimiter } from './middleware/rateLimiter';
import { responseTimeMonitor } from './middleware/responseTime';
import { sanitizeInputs } from './middleware/sanitize';
import router from './routes';

config();

// eslint-disable-next-line no-console
console.log('Starting server initialization...');

const app = express();
const port = process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT, 10)
    : 4000;

app.use(helmet());

app.use(requestIdMiddleware);

app.use(morgan(logFormat));

app.use(responseTimeMonitor);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(sanitizeInputs);

app.use(standardLimiter);

app.use('/api', router);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use(errorHandler);

const server = app.listen(port, '0.0.0.0', (error) => {
    if (error) {
        throw error; // e.g. EADDRINUSE
    }
    // eslint-disable-next-line no-console
    console.log(`Listening on ${JSON.stringify(server.address())}`);
});
