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
router.get('/signin', userController.renderSignInPage);
router.get('/register', userController.renderRegisterPage);
router.get('/profile', passportConfig.isAuthenticated, userController.renderProfilePage);

router.post('/signin', userController.signInUser);
router.get('/signout', userController.signOutUser);
router.post('/register', userController.registerUser);

module.exports = router;