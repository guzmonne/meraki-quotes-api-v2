'use strict';

const withAuth = require('../../middlewares/withAuth.js');
const dynamo = require('../../modules/aws.js').DynamoDB;
const createResponse = require('../../modules/utils.js').createResponse;

const TABLE_NAME = process.env.HELPERS_TABLE_NAME;

exports.handler = withAuth(function(event, context, callback) {
	dynamo.get({
		TableName: TABLE_NAME,
		Key: {
			helperName: 'UserPermissions',
		}
	})
	.promise()
	.then(data => {
		if (!data.Item) {
			callback(null, createResponse(404, 'Item not found'));
			return;
		}
		console.log('Found users permissons.');
		callback(null, createResponse(200, data.Item.values));
	})
	.catch(error => {
    console.log(error.message);
		callback(null, createResponse(400, error.message));
	});
});
