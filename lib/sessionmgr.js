function SessionManager(options, serializeUser) {
  if (typeof options == 'function') {
    serializeUser = options;
    options = undefined;
  }
  options = options || {};

  this.legacy = true;
  this._serializeUser = serializeUser;
  this._key = options.key || 'passport';
  this._userProperty = 'user';
  this._regenerateId = true;
}

SessionManager.prototype.logIn = function(req, user, cb) {
  var self = this;
  this._serializeUser(user, req, function(err, obj) {
    if (err) { return cb(err); }
    // TODO: Cb with error
    if (req.session) {
      if (self._regenerateId) {
        req.session.regenerate(function (err) {
          if (err) { return cb(err); }
          req.session[self._key] = { user: obj };
          cb();
        });
      } else {
        req.session[self._key] = { user: obj };
        cb();
      }
    }
  });
}

SessionManager.prototype.logOut = function(req, cb) {
  if (req.session && req.session[this._key]) {
    delete req.session[this._key].user;
  }
  cb && cb();
}


module.exports = SessionManager;
