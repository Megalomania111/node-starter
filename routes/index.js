const indexPageController = require('../controllers/index');

const router = require('express').Router();

router.get('/', indexPageController.renderIndexPage);

module.exports = router;