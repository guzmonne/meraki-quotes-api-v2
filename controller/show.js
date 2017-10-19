'use strict';

const isEmpty = require('lodash/isEmpty.js');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

exports = module.exports = (config) => (event, context, callback) => {
  const key = utils.btoj(event.pathParameters.key);

  if (utils.isValid(config.key, key, callback) === false) return;

  dynamo.get({
    TableName: process.env.TABLE_NAME,
    Key: key
  }).promise()
  .then(data => {
    if (isEmpty(data.Item)) {
      console.log(`${config.type} with the following key does not exists.`)
      console.log(key);
      throw new utils.ElementDoesNotExistsError(config.type, key);      
    }
    console.log(`${config.type} found.`);
    callback(null, utils.createResponse(200, data.Item));
  })
	.catch(err => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
	});
};
