'use strict';

const Joi = require('joi');
const compose = require('../middlewares/helpers.js').compose;
const index = require('../controller/index.js');

const keySchema = Joi.object().keys({
  email: Joi.string().email().required(),
});

exports = module.exports = index({
  type: 'Users', 
  tableName: process.env.USERS_TABLE_NAME,
  attributesToGet: [
    'ID',
    'email',
    'username',
    'createdAt',
    'updatedAt',
    'verified',
  ]
});
