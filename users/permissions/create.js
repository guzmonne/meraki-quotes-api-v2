'use strict';

const Joi = require('joi');
const dynamo = require('../../modules/aws.js').DynamoDB;
const utils = require('../../modules/utils.js');

const TABLE_NAME = process.env.HELPERS_TABLE_NAME;

const methods = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];

const schema = Joi.object().keys({
	method: Joi.string().valid(methods).required(),
	permission: Joi.string().required(),
	url: Joi.string().uri({relativeOnly: true}).required(),
});

exports = module.exports = (req, res) => {
  const body = req.body;

	if (utils.isValid(schema, body, res) === false) return;

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
    res.status(201).send();
	})
	.catch(error => {
    console.log(error.message);
    res.status(400).json({
      name: error.name,
      messag: error.message,
    });
	});
}
