'use strict';

const withAuth = require('../middlewares/withAuth.js');
const show = require('../controller/show.js');
const config = require('./config.js');

exports.handler = withAuth(show(config));
