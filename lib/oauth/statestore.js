var uri = require('url');


function CeremonyStateStore(store, toHandle) {
  this._store = store;
  this._toHandle = toHandle;
}

CeremonyStateStore.prototype.get = function(req, token, meta, cb) {
  function loaded(err, state) {
    if (err) { return cb(err); }
    if (!state) { return cb(null, false); }
    
    if (state.name !== 'sso/oauth') {
      return cb(null, false);
    }
    if (state.authorizationURL !== meta.userAuthorizationURL) {
      return cb(null, false);
    }
    if (state.consumerKey !== meta.consumerKey) {
      return cb(null, false);
    }
    
    var tokenSecret = state.tokenSecret;
    delete state.tokenSecret;
    
    return cb(null, tokenSecret, state);
  }
  
  
  if (req.state && req.state.name == 'sso/oauth') {
    loaded(null, req.state);
  } else {
    var host = (req.params && req.params.host) || uri.parse(meta.userAuthorizationURL).hostname;
    var h = this._toHandle(host, token);
    this._store.load(req, h, loaded);
  }
}

CeremonyStateStore.prototype.set = function(req, token, tokenSecret, meta, cb) {
  var url = uri.parse(meta.userAuthorizationURL);
  var h = this._toHandle(url.hostname, token);
  
  var state = {
    name: 'sso/oauth',
    authorizationURL: meta.userAuthorizationURL,
    consumerKey: meta.consumerKey,
    tokenSecret: tokenSecret
  };
  var ps = (req.query && req.query.state) || (req.body && req.body.state);
  if (ps) { state.prev = ps; }
  
  this._store.save(req, state, { h: h }, function(err, h) {
    if (err) { return cb(err); }
    return cb(null);
  });
}

CeremonyStateStore.prototype.destroy = function(req, token, meta, cb) {
  var host = (req.params && req.params.host) || uri.parse(meta.userAuthorizationURL).hostname;
  var h = this._toHandle(host, token);
  
  this._store.destroy(req, h, function(err) {
    if (err) { return cb(err); }
    return cb(null);
  });
}


module.exports = CeremonyStateStore;