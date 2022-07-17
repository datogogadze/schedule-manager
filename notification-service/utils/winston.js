const winston = require('winston');

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), myFormat),
    }),
    new winston.transports.File({
      filename: 'combined.log',
      format: winston.format.combine(winston.format.timestamp(), myFormat),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        myFormat
      ),
    })
  );
}

module.exports = logger;
