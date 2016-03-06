'use strict';
const User = require('../models/user');
const passport = require('passport');
const crypto = require('crypto');
const async = require('async');
const nodemailer = require('nodemailer');

/**
* Render login page
*/
exports.renderSignInPage = function (req, res) {
  res.render('./account/signin', {
    title: 'Sign in page'
  });
};

/**
* Render profile page
*/
exports.renderProfilePage = function (req, res) {
  res.render('./account/profile', {
    title: 'Profile page'
  });
};

/**
* Render register page
*/
exports.renderRegisterPage = function (req, res) {
  res.render('./account/register', {
    title: 'Register page'
  });
};

/**
* Render forgot password page
*/
exports.renderForgotPasswordPage = function (req, res) {
  res.render('./account/forgot', {
    title: 'Forgot password'
  });
};

/**
* Render reset password page
*/
exports.renderResetPasswordPage = function (req, res, next) {
  User.findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('./account/reset', {
        title: 'Reset Password',
        passwordResetToken: user.passwordResetToken
      });
    });
};

exports.signInUser = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/signin');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect('/profile');
    });
  })(req, res, next);
};

exports.signOutUser = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.registerUser = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('name', 'Name cannot be blank').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/register');
  }

  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({email: req.body.email}, (err, user) => {
    if (user) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/register');
    }

    newUser.save((err) => {
      if (err) {
        return next(err);
      }
      req.logIn(newUser, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/profile');
      });
    });
  });
};

exports.updateUser = function (req, res) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('name', 'Name cannot be blank').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/profile');
  }

  User.findOne({email: req.body.email}, (err, user) => {
    if (err) {
      req.flash('errors', { msg: 'Unable to save. ' + err.message });
      return res.redirect('/profile');
    }

    user.email = req.body.email;
    user.name = req.body.name;
    user.save((err) => {
      if (err) {
        req.flash('errors', { msg: 'Unable to save. ' + err.message });
        return res.redirect('/profile');
      }
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/profile');
    });
  });
};

exports.resetPassword = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();

  let errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    (done) => {
      crypto.randomBytes(16, function(err, buf) {
        let token = buf.toString('hex');
        done(err, token);
      });
    },

    (token, done) => {
      User.findOne({email: req.body.email}, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          req.flash('errors', { msg: 'No account with that email address not exists.' });
          return res.redirect('/forgot');
        }

        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          if (err) {
            return done(err);
          }

          done(err, user, token);
        });
      });
    },

    (user, token, done) => {
      var transporter = nodemailer.createTransport({
        service: 'MailGun',
        auth: {
          user: process.env.MAILGUN_USER,
          pass: process.env.MAILGUN_PASSWORD
        }
      });

      var mailOptions = {
        to: user.email,
        from: `Reset password <${process.env.MAILGUN_USER}>`,
        subject: 'Reset your password',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        done(err);
      });
    }
  ], (err) => {
    if (err) {
      return next(err);
    }

    req.flash('success', { msg: 'We have send you an email with reset password instruction.' });
    res.redirect('/forgot');
  });
};

exports.saveResetPassword = function (req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);

  let errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    (done) => {
      User.findOne({passwordResetToken: req.params.token}, (err, user) => {
        if (err) {
          return done(err);
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        user.save((err) => {
          if (err) {
            return done(err);
          }

          done(err, user);
        });
      });
    },

    (user, done) => {
      var transporter = nodemailer.createTransport({
        service: 'MailGun',
        auth: {
          user: process.env.MAILGUN_USER,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: `Reset password <${process.env.MAILGUN_USER}>`,
        subject: 'Reset password',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        done(err, user);
      });
    }
  ], (err, user) => {
    if (err) {
      return next(err);
    }

    req.flash('success', { msg: 'Success! Your password has been changed.' });
    req.logIn(user, () => {
        if (err) {
          return next(err);
        }
        res.redirect('/signin');
    });
    
  });
};