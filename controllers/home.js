'use strict';
exports.renderHomePage = function (req, res) {
  res.render('home', {
    title: 'Node-Starter - Home page',
    user: req.user
  });
};