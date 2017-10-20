'use strict';

const Joi = require('joi');
const utils = require('../modules/utils.js');
const dynamo = require('../modules/aws.js').DynamoDB;

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  permissions: Joi.array(),
  username: Joi.string(),
  ID: Joi.string(),
});

exports = module.exports = (req, res) => {
  const user = req.user;
  
  if (utils.isValid(schema, user, res) === false) return;
  
  dynamo.get({
    TableName: process.env.USERS_TABLE_NAME,
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
    res.status(200).json(Object.assign(
      data.Item, user
    ));
  })
	.catch(error => {
		console.log(error.message);
		res.status(400, {
      name: error.name,
      message: error.message,
    });
	});
};
