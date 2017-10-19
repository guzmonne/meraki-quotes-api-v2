'use strict';

const Joi = require('joi');
const withAuth = require('../../middlewares/withAuth.js');
const dynamo = require('../../modules/aws.js').DynamoDB;
const utils = require('../../modules/utils.js');

const TABLE_NAME = process.env.HELPERS_TABLE_NAME;

const methods = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];

const schema = Joi.object().keys({
	method: Joi.string().valid(methods).required(),
	permission: Joi.string().required(),
	url: Joi.string().uri({relativeOnly: true}).required(),
});

exports.handler = withAuth(function(event, context, callback) {
  const body = JSON.parse(event.body || '{}');

	const isValid = utils.isValid(schema, body);

	if (isValid !== true) {
		callback(null, utils.createResponse(400, isValid));
		return;
	};

	dynamo.get({
		TableName: TABLE_NAME,
		Key: {
			helperName: 'UserPermissions',
		}
	})
	.promise()
	.then(data => {
		console.log('Permissions retrieved');
		return dynamo.put({
			TableName: TABLE_NAME,
			Item: Object.assign(data.Item, {
				values: data.Item.values.concat(body),
			})
		}).promise()
	})
	.then(data => {
		console.log('Permission saved');
		callback(null, utils.createResponse(201));
	})
	.catch(error => {
		console.log(JSON.stringify(error, null, 2));
		callback(null, utils.createResponse(400, error));
	});
});
