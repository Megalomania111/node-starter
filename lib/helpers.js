module.exports = function (app) {
  const locals = app.locals;

  app.use((req, res, next) => {

    res.locals.isCurrentPage = function (path) {
      return req.path === path;
    };

    res.locals.isAuthenticated = function () {
      return req.isAuthenticated() || req.user;
    };
    
    res.locals.user = req.user;

    next();
  });
};