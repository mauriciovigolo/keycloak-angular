/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import winston from 'winston/lib/winston';

const { combine, timestamp, printf } = winston.format;

const customFormat = printf(info => {
  return `\n${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), customFormat),
  transports: [new winston.transports.Console()]
});

module.exports = { logger };
