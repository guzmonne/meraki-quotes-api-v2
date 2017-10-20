'use strict';

const Joi = require('joi');
const update = require('../controller/update.js');

const permissions = [
  'users-destroy',
  'users-update',
];

exports = module.exports = update({
  type: 'User',
  tableName: process.env.USERS_TABLE_NAME,
  hash: 'email',
  body: Joi.object().keys({
    username: Joi.string(),
    permissions: Joi.array().items(Joi.string().valid(permissions)),
  })
});
