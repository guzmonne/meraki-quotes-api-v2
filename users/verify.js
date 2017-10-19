'use strict';

const Joi = require('joi');
const get = require('lodash/get');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const TABLE_NAME = process.env.TABLE_NAME;

const schema = Joi.object().keys({
	email: Joi.string().email().required(),
	verifyToken: Joi.string().required(),
});

exports.handler = function(event, context, callback) {
	const query = event.queryStringParameters;
	const isValid = utils.isValid(schema, query);

	if (isValid !== true) {
		callback(null, utils.createResponse(400, isValid));
		return;
	};

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
			console.log(`User ${email} has already been verified.`);
			callback(null, utils.createResponse(400, {
				name: 'UserIsAlreadyVerified',
				message: 'User has already been verified.'
			}));
		}

		if (verifyToken === undefined) {
			console.log('The "verifyToken" value us undefined');
			callback(null, utils.createResponse(400, {
				name: 'VerifyTokenIsUndefined',
				message: 'The stored verifyToken value is undefined.'
			}));
		}

		if (verifyToken !== query.verifyToken) {
			console.log('Verification token doesn\'t match.');
			callback(null, utils.createResponse(400, {
				name: 'VerificationTokenMismatch',
				message: 'The verifyToken provided is invalid',
			}));
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
		callback(null, utils.createResponse(202));
	})
	.catch(err => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
	})
}
