'use strict';

const merge = require('lodash/merge');
const indexQuery = require('../middlewares/indexQuery.js');

exports = module.exports = (config) => {
  config = merge({}, {
    handlers: {
      index: require('./index.js')(config),
      create: require('./create.js')(config),
      show: require('./show.js')(config),
      update: require('./update.js')(config),
      destroy: require('./destroy.js')(config),
    }
  }, config)

  const router = require('express').Router();

  router.get('/', indexQuery(config.key), config.handlers.index);
  
  router.post('/', config.handlers.create);
  
  router.get('/:key', config.handlers.show);
  
  router.put('/:key', config.handlers.update);
  
  router.delete('/:key', config.handlers.destroy);

  return router;
}
