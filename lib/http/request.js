/**
 * Module dependencies.
 */
//var http = require('http')
//  , req = http.IncomingMessage.prototype;


var req = exports = module.exports = {};

/**
 * Initiate a login session for `user`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *   - `regenerate_session` Regenerate the session id, defaults to _true_
 *
 * Examples:
 *
 *     req.logIn(user, { session: false });
 *
 *     req.logIn(user, function(err) {
 *       if (err) { throw err; }
 *       // session saved
 *     });
 *
 * @param {User} user
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
req.login =
req.logIn = function(user, options, done) {
  if (typeof options == 'function') {
    done = options;
    options = {};
  }
  options = options || {};

  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }
  var session = (options.session === undefined) ? true : options.session;
  var regenerate_session = (options.regenerate_session === undefined) ? true : options.regenerate_session;

  if (session) {
    if (!this._passport) { throw new Error('passport.initialize() middleware not in use'); }
    if (typeof done != 'function') { throw new Error('req#login requires a callback function'); }

    var self = this;
    this._passport.instance.serializeUser(user, this, function(err, obj) {
      if (err) { self[property] = null; return done(err); }
      if (!self._passport.session) {
        self._passport.session = {};
      }

      var setUser = function () {
        self[property] = user;
        self._passport.session.user = obj;
        self.session[self._passport.instance._key] = self._passport.session;
        done();
      }

      if (regenerate_session) {
        self.session.regenerate(function(err) {
          if (err) { self[property] = null; return done(err); }
          setUser();
        });
      } else {
        setUser();
      }

    });
  } else {
    this[property] = user;
    done && done();
  }
};

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logout =
req.logOut = function() {
  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }

  this[property] = null;
  if (this._passport && this._passport.session) {
    delete this._passport.session.user;
  }
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }

  return (this[property]) ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function() {
  return !this.isAuthenticated();
};
