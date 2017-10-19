'use strict';

const Joi = require('joi');
const withAuth = require('../middlewares/withAuth.js');
const update = require('../controller/update.js');
const config = require('./config.js');

exports.handler = withAuth(update(config));
