'use strict';
/**
* Module dependencies
*/
const homePageController = require('../controllers/home');
const userController = require('../controllers/user');
const passportConfig = require('../config/passport');
const passport = require('passport');
const router = require('express').Router();

/**
* Home page
*/
router.get('/', homePageController.renderHomePage);

/**
* User
*/
router.get('/signin', passportConfig.isUnAuthenticated, userController.renderSignInPage);
router.post('/signin', userController.signInUser);
router.get('/register', passportConfig.isUnAuthenticated, userController.renderRegisterPage);
router.post('/register', userController.registerUser);

router.get('/forgot', passportConfig.isUnAuthenticated, userController.renderForgotPasswordPage);
router.post('/forgot', userController.resetPassword);
router.get('/reset/:token', passportConfig.isUnAuthenticated, userController.renderResetPasswordPage);
router.post('/reset/:token', passportConfig.isUnAuthenticated, userController.saveResetPassword);

router.get('/signout', userController.signOutUser);

router.get('/profile', passportConfig.isAuthenticated, userController.renderProfilePage);
router.post('/profile/update', passportConfig.isAuthenticated, userController.updateUser);
router.post('/profile/password', passportConfig.isAuthenticated, userController.updatePassword);
router.get('/profile/unlink/:provider', userController.authUnlink);
router.post('/profile/delete', userController.deleteUser);

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/signin' }), function(req, res) {
  res.redirect('/profile');
});

router.get('/auth/vkontakte', passport.authenticate('vkontakte', { scope: ['email'] }));
router.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', { failureRedirect: '/signin' }), function(req, res) {
  res.redirect('/profile');
});

module.exports = router;