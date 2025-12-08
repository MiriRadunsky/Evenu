import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

const logFormat = winston.format.printf(({ level, message, timestamp, requestId, path, method }) => {
  return `[${timestamp}] [${level.toUpperCase()}] [${requestId || '-'}] ${method || ''} ${path || ''} - ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    // INFO logs
    new DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    }),
    // ERROR logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    }),
    new winston.transports.Console()
  ]
});

export const requestLogger = (req, res, next) => {
  req.requestId = uuidv4();

  res.on('finish', () => {
    logger.info({
      message: `Request finished with status ${res.statusCode}`,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl
    });
  });

  next();
};

export const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl
  });
  next(err);
};

export default logger;
