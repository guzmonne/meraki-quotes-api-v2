'use strict';

const dynamo = require('../../modules/aws.js').DynamoDB;
const createResponse = require('../../modules/utils.js').createResponse;

const TABLE_NAME = process.env.HELPERS_TABLE_NAME;

exports = module.exports = function(req, res) {
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
		res.status(200).json(data.Item.values);
	})
  .catch(error => {
    console.log(error.message);
    res.status(400).json({
      name: error.name,
      messag: error.message,
    });
	});
}
