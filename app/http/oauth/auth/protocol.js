exports = module.exports = function(verify, store) {
  var clone = require('clone')
    , providers = require('../../../../lib/oauth/providers');
  
  
  return {
    canCreate: function(options) {
      if (options.protocol == 'oauth') { return true; }
      return false;
    },
    
    create: function(options) {
      var provider = options.identifier
        , opts = clone(options)
        , pkg = providers.getPackage(provider)
        , mod, Strategy;
      
      mod = require(pkg);
      Strategy = mod.Strategy;
      
      delete opts.protocol;
      delete opts.identifier;
      opts.requestTokenStore = store;
      
      return new Strategy(opts, verify(provider));
    }
  };
};

exports['@protocol'] = 'oauth';
exports['@singleton'] = true;
exports['@require'] = [
  './middleware/verify',
  './state/store'
];
