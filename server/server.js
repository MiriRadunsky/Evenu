require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectMongo } = require('./db/connect.db');
const mongoHealth = require('./db/health.db');
const { errorHandler } = require('./middlewares/error');

const app = express();
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


app.get('/health', (req, res) => {
  res.status(200).json({ up: true });
});

app.get('/health/mongo', mongoHealth);

app.get('/', (req, res) => res.send('🏠 This is the Home Page'));

app.use(errorHandler);

connectMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
