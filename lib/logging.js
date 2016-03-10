'use strict';
const winston = require( 'winston' );
const chalk = require('chalk');
const moment = require('moment');
var config = require('winston/lib/winston/config');
function formater(options) {
  return `${options.timestamp()} ${config.colorize(options.level, options.level.toUpperCase())} ${(undefined !== options.message ? options.message : '')} ${(options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' )}`;
}

let customLevels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  }
};

let transports = [
  new winston.transports.Console({
    timestamp: () => {
      return moment().format('MM.DD.YYYY, h:mm:ss');
    },
    colorize: true,
    stripColors: true,
    level: 'info',
    formatter: formater
  }),
  new winston.transports.File({
    filename: process.env.LOG_FILE,
    timestamp: () => {
      return moment().format('MM.DD.YYYY, h:mm:ss');
    },
    maxsize: process.env.LOG_FILE_MAX,
    level: 'error',
    formatter: formater
  })
];

const logger = new winston.Logger({
  transports: transports/*,
  levels: customLevels.levels,
  colors: customLevels.colors*/
});

exports.logger = logger;

exports.requestLogger = function () {
  return function (req, res, next) {
    logger.info(`${res.statusCode} HTTP ${req.method} "${req.url}"`);
    next();
  };
};

exports.errorLogger = function () {
  return function (err, req, res) {
    console.log('good');
    logger.error(`${res.statusCode} HTTP ${req.method} "${req.url}" хуц`);
  };
};