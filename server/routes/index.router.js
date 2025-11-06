const express = require('express');
const router = express.Router();

const authRouter    = require('./auth.route');   
const supplierRouter     = require('./supplier.routes');      
const eventRouter        = require('./event.routes');
const requestRouter      = require('./request.routes');
const contractRouter     = require('./contract.routes');
const notificationRouter = require('./notification.routes');

app.get('/', (req, res) => res.send('🏠 This is the Home Page'));
router.use('/auth', authRouter);
router.use('/suppliers', supplierRouter);
router.use('/events', eventRouter);
router.use('/requests', requestRouter);
router.use('/contracts', contractRouter);
router.use('/notifications', notificationRouter);

router.get('/health', (req, res) => res.json({ up: true }));

// ---- 404 לנתיבים שלא נתפסו בתוך /api ----
router.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
