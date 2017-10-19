'use strict';

const Joi = require('joi');
const withAuth = require('../middlewares/withAuth.js');
const update = require('../controller/update.js');

const permissions = [
  'users-destroy',
  'users-update',
];

exports.handler = withAuth('users-update', update({
  type: 'User',
  hash: 'email',
  body: Joi.object().keys({
    username: Joi.string(),
    permissions: Joi.array().items(Joi.string().valid(permissions)),
  })
}));
