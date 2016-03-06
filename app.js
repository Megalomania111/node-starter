'use strict';
/**
* Application dependencies
*/
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const helmet = require('helmet');
const passport = require('passport');
const flash = require('express-flash');
const dotenv = require('dotenv').load({ path: '.env' });
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const ejsEngine = require('ejs-locals');
const validator = require('express-validator');
const passportConfig = require('./config/passport');
const path = require('path');
const sass = require('node-sass-middleware');
const logging = require('./lib/logging');
const logger = logging.logger;
const requestLogger = logging.requestLogger;
const errorLogger = logging.errorLogger;
const menu = require('./lib/menu');

/**
* Create express app
*/
const app = express();
const server = require('http').Server(app);

/**
* Connect to MongoDB
*/
mongoose.set('debug', true);
mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('open', () => {
  logger.info('MongoDB connection opened.');

  server.listen(app.get('port'), () => {
    logger.info(`Application is running on port ${app.get('port')}`);
  });
});

mongoose.connection.on('error', () => {
  logger.error('MongoDB Connection Error.');
  process.exit(1);
});

mongoose.set('debug', function (collectionName, method, query, doc) {
  logger.info(`Mongoose ${collectionName}.${method}(${JSON.stringify(query)}) ${JSON.stringify(doc)}`);
});

/**
* Express configuration
*/
app.engine('ejs', ejsEngine);
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(requestLogger());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  outputStyle: 'compressed',
  debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));
// helpers lib
require('./lib/helpers')(app);

/**
* Routes
*/
app.use('/', require('./routes'));

/**
* Error handler
*/
app.use(function(req, res, next) {
  res.status(404).render('error', {
    title: 'Error',
    message: 'Not found',
    status: 404,
    user: req.user
  });
  next();
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message,
    status: err.status || 500,
    user: req.user
  });
  logger.error(`${err.message}`);
});

app.use(errorLogger());

module.exports = app;