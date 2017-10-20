'use strict';

const Joi = require('joi');
const destroy = require('../controller/destroy.js');

exports = module.exports = destroy({
  type: 'User',
  key: {
    email: Joi.string().email().required(),
  },
  tableName: process.env.USERS_TABLE_NAME,
})
