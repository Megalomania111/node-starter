'use strict';
const User = require('../models/user');
const passport = require('passport');

/**
* Render login page
*/
exports.renderSignInPage = function (req, res) {
  res.render('./account/signin', {
    title: 'Sign in page',
    user: req.user
  });
};

/**
* Render profile page
*/
exports.renderProfilePage = function (req, res) {
  res.render('./account/profile', {
    title: 'Profile page',
    user: req.user
  });
};

/**
* Render register page
*/
exports.renderRegisterPage = function (req, res) {
  res.render('./account/register', {
    title: 'Register page',
    user: req.user
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