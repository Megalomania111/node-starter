'use strict';

function Middleware(name, links) {
  let a = false;
  
  return function (req, res, next) {
    if (req.user) {
      a = ((req.user !== undefined) || req.user.isAuthenticated());
    }
    const menu = new Menu(links, req.path, a);
    menu.update(req.path, a);

    req.app.locals[name] = menu;
    next();
  };
}


function Menu(links, currentUrl, isAuthorized){
  this.links = links;
  this.currentUrl = currentUrl;
  this.isAuthorized = isAuthorized;
}

Menu.prototype.update = function (currentUrl, isAuthorized) {
  this.currentUrl = currentUrl;
  this.isAuthorized = isAuthorized;
};

Menu.prototype.render = function () {
  if (this.links.length > 0) {

  }
  let template = '';
  let i = 0, max = this.links.length;
  for (; i < max; i++) {
    template += this.getItemTemplate(this.links[i]);
  }

  return template;
};

Menu.prototype.getItemTemplate = function (item) {
  let active = '';
  if (this.currentUrl === item.url) {
    active = ' class="active" ';
  }

  if ((item.authenticated === true) && (this.isAuthorized === false)) {
    return '';
  }

  if ((item.guest === true) && (this.isAuthorized === true)) {
    return '';
  }

  return `<li${active}><a href="${item.url}">${item.label}</a></li>`;
};

module.exports = Middleware;