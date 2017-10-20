'use stict';

const Joi = require('joi');

let router = require('express').Router();

const permissions = [
  'users-destroy',
  'users-update',
];

router.post('/login', require('./login.js'));

router.get('/verify', require('./verify.js'));

router.use(require('../middlewares/auth.js'));

router.post('/changePassword', require('./changePassword.js'));

router.get('/me', require('./me.js'));

router.get('/permissions', require('./permissions/index.js'));

router.post('/permissions', require('./permissions/create.js'));

router.use(require('../controller/createController.js')({
  type: 'User',
  key: {
    email: Joi.string().email().required(),
  },
  tableName: process.env.USERS_TABLE_NAME,
  handlers: {
    create: require('./create.js'),
  },
  attributesToGet: [
    'ID',
    'email',
    'username',
    'createdAt',
    'updatedAt',
    'verified',
  ],
  hash: 'email',
  body: Joi.object().keys({
    username: Joi.string(),
    permissions: Joi.array().items(Joi.string().valid(permissions)),
  }),
}));

exports = module.exports = router;
