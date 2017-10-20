'use strict';

const Joi = require('joi');
const show = require('../controller/show.js');

exports = module.exports = show({
  key: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  tableName: process.env.USERS_TABLE_NAME,
  type: 'User',
  attributesToGet: [
    'ID',
    'email',
    'username',
    'createdAt',
    'updatedAt',
    'verified',
    'verifyToken'
  ]
});
