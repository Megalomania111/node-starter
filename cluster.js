'use strict';

const path = require('path');
const dotenv = require('dotenv').load({ path: '.env' });
const logger = require('./lib/logging').logger;
const cluster = require('cluster');
const cpuCount = require('os').cpus().length;

cluster.setupMaster({
  exec: 'app.js'
});

cluster.on('exit', function(worker) {
  logger.error(`Worker ${worker.id} died`);
  cluster.fork();
});

for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
}