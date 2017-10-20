'use strict';

const Joi = require('joi');
const get = require('lodash/get');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const TABLE_NAME = process.env.USERS_TABLE_NAME;

const schema = Joi.object().keys({
	email: Joi.string().email().required(),
	verifyToken: Joi.string().required(),
});

exports = module.exports = (req, res) => {
	const query = req.query;
  
  if (utils.isValid(schema, query, res) === false) return;
  
	const email = query.email;

	dynamo.get({
		TableName: TABLE_NAME,
		Key: {email}
	})
	.promise()
	.then(data => {
		console.log('User found.');
		const verified = get(data, 'Item.verified');
		const verifyToken = get(data, 'Item.verifyToken');

		if (verified === true) {
      throw new UserHasAlreadyBeenVerifiedError(email);
		}

		if (verifyToken === undefined) {
      throw new VerifyTokenIsUndefinedError();
		}

		if (verifyToken !== query.verifyToken) {
      throw new VerifyTokenIsInvalidError();
		}

		console.log('Verification token match.');

		return dynamo.update({
			TableName: TABLE_NAME,
			Key: {email},
			UpdateExpression: 'set #v = :v, #uA = :uA',
			ExpressionAttributeNames: {
				'#v': 'verified',
				'#uA': 'updatedAt',
			},
			ExpressionAttributeValues: {
				':v': true,
				':uA': Date.now(),
			}
		}).promise();
	})
	.then((data) => {
    console.log('User verified.');
    res.status(202).send();
	})
	.catch(error => {
		console.log(error.message);
		res.status(400).json({
      name: error.name,
      message: error.message,
    })
	})
}

function UserHasAlreadyBeenVerifiedError(email) {
  this.name = 'UserHasAlreadyBeenVerified';
  this.message = `User ${email} has already been verified.`
}

function VerifyTokenIsUndefinedError() {
  this.name = 'VerifyTokenIsUndefinedError';
  this.message = 'The stored verifyToken value is undefined.';
}

function VerifyTokenIsInvalidError() {
  this.name = 'VerifyTokenIsInvalid';
  this.message = 'Verification token doesn\'t match.';
}
