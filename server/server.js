import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initWebSocket } from "./websocket/notification.socket.js"
import helmet from 'helmet';
import http from 'http';
import rateLimit from 'express-rate-limit';
import router from './routes/index.router.js';
import { connectMongo } from './db/connect.db.js';
import { mongoHealth } from './db/health.db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { initSocket } from './sockets/message.gateway.js';

import session from 'express-session';
import passport from './config/passport.config.js';
const app = express();
const server = http.createServer(app);
initWebSocket(server);
initSocket(server);
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(express.json());

app.use(express.static('public'));

const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);
app.use('/api',router)
app.get('/health/mongo', mongoHealth);
app.use(errorHandler);

app.use(passport.initialize());
connectMongo().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
