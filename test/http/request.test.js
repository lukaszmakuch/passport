/* global describe, it, expect, before */
/* jshint expr: true */

var http = require('http')
  , Passport = require('../..').Passport;

require('../../lib/framework/connect').__monkeypatchNode();


describe('http.ServerRequest', function() {

  describe('prototoype', function() {
    var req = new http.IncomingMessage();

    it('should be extended with login', function() {
      expect(req.login).to.be.an('function');
      expect(req.login).to.equal(req.logIn);
    });

    it('should be extended with logout', function() {
      expect(req.logout).to.be.an('function');
      expect(req.logout).to.equal(req.logOut);
    });

    it('should be extended with isAuthenticated', function() {
      expect(req.isAuthenticated).to.be.an('function');
    });

    it('should be extended with isUnauthenticated', function() {
      expect(req.isUnauthenticated).to.be.an('function');
    });
  });

  describe('#login', function() {

    var passport, sessionDouble, req;
    sessionDouble = require('./../session_test_double');

    var resetPassport = function() {
      passport = new Passport();
      sessionDouble.clear();
      req = new http.IncomingMessage();
      req._passport = {};
      req._passport.instance = passport;
      req._passport.session = {};
      req.session = sessionDouble;
    }


    describe('not establishing a session', function() {
      var error;
      before(function(done) {
        resetPassport();
        var user = { id: '1', username: 'root' };

        req.login(user, { session: false }, function(err) {
          error = err;
          done();
        });
      });

      it('should not error', function() {
        expect(error).to.be.undefined;
      });

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });

      it('should set user', function() {
        expect(req.user).to.be.an('object');
        expect(req.user.id).to.equal('1');
        expect(req.user.username).to.equal('root');
      });

      it('should not serialize user', function() {
        expect(sessionDouble.empty).to.be.true;
      });
    });

    describe('not establishing a session and setting custom user property', function() {
      var error;
      before(function(done) {
        resetPassport();
        req._passport.sm = {};
        req._passport.sm._userProperty = 'currentUser';
        var user = { id: '1', username: 'root' };

        req.login(user, { session: false }, function(err) {
          error = err;
          done();
        });
      });

      it('should not error', function() {
        expect(error).to.be.undefined;
      });

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });

      it('should not set user', function() {
        expect(req.user).to.be.undefined;
      });

      it('should set custom user', function() {
        expect(req.currentUser).to.be.an('object');
        expect(req.currentUser.id).to.equal('1');
        expect(req.currentUser.username).to.equal('root');
      });

      it('should not serialize user', function() {
        expect(sessionDouble.empty).to.be.true;
      });
    });

    describe('not establishing a session and invoked without a callback', function() {
      before(function () {
        resetPassport();
        var user = { id: '1', username: 'root' };
        req.login(user, { session: false });
      });

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });

      it('should set user', function() {
        expect(req.user).to.be.an('object');
        expect(req.user.id).to.equal('1');
        expect(req.user.username).to.equal('root');
      });

      it('should not serialize user', function() {
        expect(sessionDouble.empty).to.be.true;
      });
    });

    describe('not establishing a session, without passport.initialize() middleware', function() {
      var error;
      before(function(done) {
        var user = { id: '1', username: 'root' };

        req.login(user, { session: false }, function(err) {
          error = err;
          done();
        });
      });

      it('should not error', function() {
        expect(error).to.be.undefined;
      });

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });

      it('should set user', function() {
        expect(req.user).to.be.an('object');
        expect(req.user.id).to.equal('1');
        expect(req.user.username).to.equal('root');
      });
    });

    describe('establishing a session', function() {
      var error;
      before(function(done) {
        resetPassport();
        req._passport.sm = passport._sm;
        req._passport.session = {};
        passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
        var user = { id: '1', username: 'root' };

        req.login(user, function(err) {
          error = err;
          done();
        });
      });

      it('should not error', function() {
        expect(error).to.be.undefined;
      });

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });

      it('should set user', function() {
        expect(req.user).to.be.an('object');
        expect(req.user.id).to.equal('1');
        expect(req.user.username).to.equal('root');
      });

      it('should serialize user', function() {
        expect(sessionDouble.data).to.eql({
          '1': {},
          '2': { passport: { user: '1' } }
        });
      });
    });

    describe('establishing a session without id regeneration', function() {
      var error;
      before(function(done) {
        resetPassport();
        passport._sm._regenerateId = false;
        req._passport.sm = passport._sm;
        req._passport.session = {};
        passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
        var user = { id: '1', username: 'root' };

        req.login(user, function(err) {
          error = err;
          done();
        });
      });

      it('should serialize user within the same session', function() {
        expect(sessionDouble.data).to.eql({
          '1': { passport: { user: '1' } }
        });
      });
    });

    describe('establishing a session and setting custom user property', function() {
      var error;
      before(function(done) {
        resetPassport();
        req._passport.session = {};
        req._passport.sm = passport._sm;
        req._passport.sm._userProperty = 'currentUser';
        passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
        var user = { id: '1', username: 'root' };

        req.login(user, function(err) {
          error = err;
          done();
        });
      });

      it('should not error', function() {
        expect(error).to.be.undefined;
      });

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });

      it('should not set user', function() {
        expect(req.user).to.be.undefined;
      });

      it('should set custom user', function() {
        expect(req.currentUser).to.be.an('object');
        expect(req.currentUser.id).to.equal('1');
        expect(req.currentUser.username).to.equal('root');
      });

      it('should serialize user', function() {
        expect(req.session.passport.user).to.equal('1');
      });
    });

    describe('encountering an error when regenerating the session id', function () {
      var error;
      before(function(done) {
        resetPassport();
        req._passport.session = {};
        req._passport.sm = passport._sm;
        sessionDouble.regeneration_should_fail = true;
        passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
        var user = { id: '1', username: 'root' };

        req.login(user, function(err) {
          error = err;
          done();
        });
      });

      it('should error', function() {
        expect(error).to.equal(sessionDouble.regeneration_error);
      });

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });

      it('should not set user', function() {
        expect(req.user).to.be.null;
      });

      it('should not serialize user', function() {
        expect(sessionDouble.empty).to.be.true;
      });
    });

    describe('encountering an error when serializing to session', function() {
      var error;
      before(function(done) {
        resetPassport();
        var user = { id: '1', username: 'root' };

        req._passport.sm = passport._sm;
        req._passport.session = {};
        passport.serializeUser(function(user, done) {
          done(new Error('something went wrong'));
        });

        req.login(user, function(err) {
          error = err;
          done();
        });
      });

      it('should error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('something went wrong');
      });

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });

      it('should not set user', function() {
        expect(req.user).to.be.null;
      });

      it('should not serialize user', function() {
        expect(sessionDouble.empty).to.be.true;
      });
    });

    describe('establishing a session, without passport.initialize() middleware', function() {
      var user = { id: '1', username: 'root' };

      before(function () {
        delete(req._passport);
      });

      it('should throw an exception', function() {
        expect(function() {
          req.login(user, function(err) {});
        }).to.throw(Error, 'passport.initialize() middleware not in use');
      });
    });

    describe('establishing a session, but not passing a callback argument', function() {

      before(function () {
        resetPassport();
        req._passport.session = {};
        passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
      });

      it('should throw an exception', function() {
        var user = { id: '1', username: 'root' };
        expect(function() {
          req.login(user);
        }).to.throw(Error, 'req#login requires a callback function');
      });
    });

  });


  describe('#logout', function() {

    describe('existing session', function() {
      var passport = new Passport();

      var req = new http.IncomingMessage();
      req.user = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._passport.sm = passport._sm;
      req.session = {};
      req.session.passport = {};
      req.session.passport.user = '1';

      req.logout();

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });

      it('should clear user', function() {
        expect(req.user).to.be.null;
      });

      it('should clear serialized user', function() {
        expect(req.session.passport.user).to.be.undefined;
      });
    });

    describe('existing session and clearing custom user property', function() {
      var passport = new Passport();
      // TODO: Why doesn't this work?
      //passport.initialize({ userProperty: 'currentUser' });
      passport._sm._userProperty = 'currentUser';

      var req = new http.IncomingMessage();
      req.currentUser = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.instance = passport;
      req._passport.instance._userProperty = 'currentUser';
      req._passport.sm = passport._sm;
      req.session = {};
      req.session.passport = {};
      req.session.passport.user = '1';

      req.logout();

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });

      it('should clear user', function() {
        expect(req.currentUser).to.be.null;
      });

      it('should clear serialized user', function() {
        expect(req.session.passport.user).to.be.undefined;
      });
    });

    describe('existing session, without passport.initialize() middleware', function() {
      var req = new http.IncomingMessage();
      req.user = { id: '1', username: 'root' };

      req.logout();

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });

      it('should clear user', function() {
        expect(req.user).to.be.null;
      });
    });

  });


  describe('#isAuthenticated', function() {

    describe('with a user', function() {
      var req = new http.IncomingMessage();
      req.user = { id: '1', username: 'root' };

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });
    });

    describe('with a user set on custom property', function() {
      var req = new http.IncomingMessage();
      req.currentUser = { id: '1', username: 'root' };
      req._passport = {};
      req._passport.sm = {};
      req._passport.sm._userProperty = 'currentUser';

      it('should be authenticated', function() {
        expect(req.isAuthenticated()).to.be.true;
        expect(req.isUnauthenticated()).to.be.false;
      });
    });

    describe('without a user', function() {
      var req = new http.IncomingMessage();

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
    });

    describe('with a null user', function() {
      var req = new http.IncomingMessage();
      req.user = null;

      it('should not be authenticated', function() {
        expect(req.isAuthenticated()).to.be.false;
        expect(req.isUnauthenticated()).to.be.true;
      });
    });

  });

});
