const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.prettyPrint(),
  transports: [new transports.Console()]
});

module.exports = logger;
