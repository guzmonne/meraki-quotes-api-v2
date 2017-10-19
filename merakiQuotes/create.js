'use strict';

const Joi = require('joi');
const withAuth = require('../middlewares/withAuth.js');
const create = require('../controller/create.js');
const config = require('./config.js');

exports.handler = withAuth(create(config));
