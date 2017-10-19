'use strict';

const Joi = require('joi');
const uuid = require('uuid');
const nJwt = require('njwt');
const utils = require('../modules/utils.js');
const dynamo = require('../modules/aws.js').DynamoDB;

const SessionsTableName = process.env.SESSIONS_TABLE_NAME;
const UsersTableName = process.env.TABLE_NAME;

const schema = Joi.object().keys({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
});

exports.handler = modules.exports = (req, res) => {
	const body = req.body;
	const isValid = utils.isValid(schema, body);

	if (isValid !== true) {
		callback(null, utils.createResponse(400, isValid));
		return;
	};

	const email = body.email;
	const password = body.password;

	let user;

	dynamo.get({
		TableName: UsersTableName,
		Key: {email}
	})
	.promise()
	.then((data) => {
		console.log('User found');
		user = data.Item;
		
		if (!user)
			throw new utils.UserDoesNotExistsError();
		
		if (user.verified === false)
			throw new utils.UserIsNotVerifiedError();

		return utils.computeHash(password, user.passwordSalt);
	})
	.then((result) => {
		console.log('Hash calculated');
		const hash = result.hash;

		if (hash !== user.passwordHash)
			throw new utils.IncorrectPasswordError();

		console.log('Credentials are valid');

		return generateToken(user);
	})
	.then((session) => {
		console.log('Created session.');
		callback(null, utils.createResponse(200, session));
	})
	.catch((err) => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
	});
};

function generateToken(user) {
	const secretKey = uuid.v4();
	const claims = {
		sub: user.ID,
		iss: 'https://www.conapps.click',
		permissions: user.permissions,
		username: user.username,
		email: user.email,
	};
	const jwt = nJwt.create(claims, secretKey);
	const item = {
		jti: jwt.body.jti,
		key: secretKey,
		createdAt: Date.now(),
	}
	return dynamo.put({
		TableName: SessionsTableName,
		Item: item,
	})
	.promise()
	.then(() => ({token: jwt.compact()}))
	.catch((err) => {
		console.log(err.message);
		return Promise.reject(err);
	})
}
