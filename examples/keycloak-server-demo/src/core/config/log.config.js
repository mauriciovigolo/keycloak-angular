'use-strict';

const { createLogger, format, transports } = require('winston/lib/winston');
const { combine, timestamp, printf } = format;

const customFormat = printf(info => {
  return `\n${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), customFormat),
  transports: [new transports.Console()]
});

module.exports.logger = logger;
