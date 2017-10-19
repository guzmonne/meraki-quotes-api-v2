'use strict';

const Joi = require('joi');
const compose = require('../middlewares/helpers.js').compose;
const withAuth = require('../middlewares/withAuth.js');
const indexOptions = require('../middlewares/indexOptions.js');
const index = require('../controller/index.js');

const keySchema = Joi.object().keys({
  email: Joi.string().email().required(),
});

exports.handler = compose(
  withAuth,
  indexOptions(keySchema)
)(index({
  type: 'Users', 
  attributesToGet: [
    'ID',
    'email',
    'username',
    'createdAt',
    'updatedAt',
    'verified',
  ]
}));
