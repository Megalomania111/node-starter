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
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const ejsEngine = require('ejs-locals');
const validator = require('express-validator');
const passportConfig = require('./config/passport');
const path = require('path');
const sass = require('node-sass-middleware');
const logger = require('morgan');
const winston = require('winston');
const expressWinston = require('express-winston');
const menu = require('./lib/menu');

/**
* Create express app
*/
const app = express();
const server = require('http').Server(app);

dotenv.load({ path: '.env' });

/**
* Connect to MongoDB
*/
mongoose.set('debug', true);
mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('open', () => {
  console.log('MongoDB connection opened.');

  server.listen(app.get('port'), () => {
    console.log('Application is running on port ' + app.get('port'));
  });
});

mongoose.connection.on('error', () => {
  console.log('MongoDB Connection Error.');
  process.exit(1);
});

/**
* Express configuration
*/
app.engine('ejs', ejsEngine);
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(logger('tiny'));
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
app.use(menu('mainMenu', [
  {
    label: 'Home',
    url: '/'
  },
  {
    label: 'Sign In',
    url: '/signin',
    guest: true
  },
  {
    label: 'Register',
    url: '/register',
    guest: true
  },
  {
    label: 'Profile',
    url: '/profile',
    authenticated: true
  },
  {
    label: 'Sign Out',
    url: '/signout',
    authenticated: true
  }
]));

/**
* Routes
*/
app.use('/', require('./routes'));

/**
* Error handler
*/
app.use(function(req, res) {
  res.render('error', {
    title: 'Error',
    message: 'Not found',
    status: 404,
    user: req.user
  });
});

app.use(function(err, req, res, next) {
  res.render('error', {
    title: 'Error',
    message: err.message,
    status: err.status || 500,
    user: req.user
  });
});