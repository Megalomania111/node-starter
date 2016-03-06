'use strict';
/**
* Module dependencies
*/
const homePageController = require('../controllers/home');
const userController = require('../controllers/user');
const passportConfig = require('../config/passport');
const router = require('express').Router();

/**
* Home page
*/
router.get('/', homePageController.renderHomePage);

/**
* User
*/
router.get('/signin', passportConfig.isUnAuthenticated, userController.renderSignInPage);
router.get('/register', passportConfig.isUnAuthenticated, userController.renderRegisterPage);
router.get('/profile', passportConfig.isAuthenticated, userController.renderProfilePage);
router.get('/forgot', passportConfig.isUnAuthenticated, userController.renderForgotPasswordPage);
router.get('/reset/:token', passportConfig.isUnAuthenticated, userController.renderResetPasswordPage);

router.post('/reset/:token', passportConfig.isUnAuthenticated, userController.saveResetPassword);
router.post('/forgot', userController.resetPassword);

router.post('/signin', userController.signInUser);
router.post('/register', userController.registerUser);
router.post('/profile/update', passportConfig.isAuthenticated, userController.updateUser);
router.get('/signout', userController.signOutUser);

module.exports = router;