'use strict';

const Joi = require('joi');
const withAuth = require('../middlewares/withAuth.js');
const destroy = require('../controller/destroy.js');

exports.handler = withAuth('users-destroy', destroy({
  type: 'User',
  key: {
    email: Joi.string().email().required(),
  }
}));
