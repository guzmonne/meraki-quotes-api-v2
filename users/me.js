'use strict';

const Joi = require('joi');
const withAuth = require('../middlewares/withAuth.js');
const utils = require('../modules/utils.js');
const dynamo = require('../modules/aws.js').DynamoDB;

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  permissions: Joi.array(),
  username: Joi.string(),
  ID: Joi.string(),
});

exports.handler = withAuth((event, context, callback) => {
  const user = event.user;
  
  if (utils.isValid(schema, user, callback) === false) return;
  
  dynamo.get({
    TableName: process.env.TABLE_NAME,
    Key: {
      email: user.email,
    },
    AttributesToGet: [
      'createdAt',
      'updatedAt',
      'verified',
    ],
  })
  .promise()
  .then((data) => {
    console.log('User found.');
    callback(null, utils.createResponse(200, Object.assign(
      data.Item, user
    )));
  })
	.catch(err => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
	});
});
