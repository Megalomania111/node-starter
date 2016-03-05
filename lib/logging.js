'use strict';
const winston = require( 'winston' );
const chalk = require('chalk');
const moment = require('moment');

let transports = [
  new winston.transports.Console({
    timestamp: () => {
      return moment().format('MM.DD.YYYY, h:mm:ss');
    },
    colorize: true,
    level: 'info'
  }),
  new winston.transports.File({
    filename: process.env.LOG_FILE,
    timestamp: () => {
      return moment().format('MM.DD.YYYY, h:mm:ss');
    },
    maxsize: process.env.LOG_FILE_MAX,
    level: 'error'
  })
];

const logger = new winston.Logger({ transports: transports }) ;

exports.logger = logger;

exports.requestLogger = function () {
  return function (req, res, next) {
    logger.info(`${res.statusCode} HTTP ${req.method} "${req.url}"`);
    next();
  };
};

exports.errorLogger = function () {
  return function (req, res, next) {
    logger.error(chalk.red(`${res.statusCode} HTTP ${req.method} "${req.url}"`));
    next();
  };
};