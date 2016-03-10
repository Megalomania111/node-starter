'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook');
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const User = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/**
* Local Strategy
*/
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ email: email.toLowerCase() }, function(err, user) {
    if (!user) {
      return done(null, false, { message: 'Email ' + email + ' not found.' });
    }
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender', 'location', 'displayName'],
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.save(function(err) {
            req.flash('success', { msg: 'Facebook account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = profile._json.name;
          user.profile.gender = profile._json.gender;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with VKontakte.
 */
passport.use(new VKontakteStrategy({
  clientID: process.env.VKONTAKTE_ID,
  clientSecret: process.env.VKONTAKTE_SECRET,
  callbackURL: '/auth/vkontakte/callback',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender', 'city', 'displayName'],
  passReqToCallback: true
}, function(req, accessToken, refreshToken, params, profile, done) {
  if (req.user) {
    User.findOne({ vkontakte: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Vkontakte account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.vkontakte = profile.id;
          user.tokens.push({ kind: 'vkontakte', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile.gender;
          user.profile.picture = user.profile.picture || profile._json.photo;
          user.save(function(err) {
            req.flash('success', { msg: 'Vkontakte account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ vkontakte: profile.id }, function(err, existingUser) {
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: params.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Vkontakte manually from Account Settings.' });
          done(err);
        } else {
          var user = new User();
          user.email = params.email;
          user.vkontakte = profile.id;
          user.tokens.push({ kind: 'vkontakte', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile.gender;
          user.profile.picture = profile._json.photo;
          user.profile.location = profile._json.city;
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
};

exports.isUnAuthenticated = function(req, res, next) {
  if (req.isUnauthenticated()) {
    return next();
  }
  res.redirect('/profile');
};