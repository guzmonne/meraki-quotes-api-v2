'use strict';

const Joi = require('joi');
const compose = require('../middlewares/helpers.js').compose;
const withAuth = require('../middlewares/withAuth.js');
const indexOptions = require('../middlewares/indexOptions.js');
const index = require('../controller/index.js');
const config = require('./config.js');

exports.handler = compose(withAuth, indexOptions(config.key))(
  index(config)
);
