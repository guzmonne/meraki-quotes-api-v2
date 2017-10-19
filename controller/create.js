'use strict';

const uuid = require('uuid');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const defaultConfig = {
  updateCreatedAt: true,
  updateUpdatedAt: true,
  createUUID: true,
};

exports = module.exports = (config) => (event, context, callback) => {
  config = Object.assign({}, defaultConfig, config);
  const body = JSON.parse(event.body || '{}');

  if (utils.isValid(config.schema, body, callback) === false) return;
  
  const now = Date.now();

  if (config.updateCreatedAt)
    body.createdAt = now;
  
  if (config.updateCreatedAt)
    body.updatedAt = now;
  
  if (config.createUUID)
    body.ID = uuid.v4();

  const key = { [config.hash]: body[config.hash] }

  if (config.range)
    key[config.range] = body[config.range],

  dynamo.get({
    TableName: process.env.TABLE_NAME,
    Key: key,
  })
  .promise()
  .then(data => {
    if (data.Item && data.Item[config.hash]) {
      console.log(`${config.type} with the following key already exists:`);
      console.log(JSON.stringify(key));
      throw new utils.ElementExistsError(config.type, key);      
    }
    console.log(`Trying to create a new ${config.type}`);
    return dynamo.put({
      TableName: process.env.TABLE_NAME,
      Item: body,
    })
    .promise();
  })
	.then(() => {
		console.log(`${config.type} created.`);
		callback(null, utils.createResponse(200, {ID: body.ID}));
	})
	.catch(err => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
	});
}
