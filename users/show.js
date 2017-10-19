'use strict';

const Joi = require('joi');
const withAuth = require('../middlewares/withAuth.js');
const show = require('../controller/show.js');

exports.handler = withAuth(show({
  key: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  type: 'User',
}));
