'use strict';

const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

exports = module.exports = (config) => (event, context, callback) => {
  const key = utils.btoj(event.pathParameters.key);

  if (utils.isValid(config.key, key, callback) === false) return;

  dynamo.delete({
    TableName: process.env.TABLE_NAME,
    Key: key
  }).promise()
  .then(data => {
    console.log(`${config.type} deleted.`);
    callback(null, utils.createResponse(200));
  })
	.catch(err => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
	});
};
