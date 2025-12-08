import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initSocket } from "./websocket/socket.js"
import helmet from 'helmet';
import http from 'http';
import rateLimit from 'express-rate-limit';
import cookieParser from "cookie-parser";
import router from './routes/index.router.js';
import { connectMongo } from './db/connect.db.js';
import { mongoHealth } from './db/health.db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import session from 'express-session';
import passport from './config/passport.config.js';
// import { initWebSocket } from './websocket/notification.socket.js';
import { requestLogger, errorLogger } from './logger/logger.js';
import './queues/scheduler.js';
import './corn/eventStatusCron.js';

import { startCleanupJob } from './jobs/cleanupThreads.jobs.js';
const app = express();
const server = http.createServer(app);
initSocket(server);
const PORT = process.env.PORT || 5000;

// app.use(helmet());

app.use(express.json());

app.use(express.static('public'));

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean), 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // דקה אחת
  max: 3000,               // עד 3000 בקשות לדקה
});
app.use(limiter);
app.use(requestLogger);
app.use('/api',router)
app.get('/health/mongo', mongoHealth);
app.use(errorLogger);
app.use(errorHandler);

app.use(passport.initialize());
connectMongo().then(() => {
   startCleanupJob(); 
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
