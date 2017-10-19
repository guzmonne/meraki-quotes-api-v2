'use strict';

const withAuth = require('../middlewares/withAuth.js');
const destroy = require('../controller/destroy.js');
const config = require('./config.js');

exports.handler = withAuth(destroy(config));
