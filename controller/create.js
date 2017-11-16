'use strict';

const uuid = require('uuid');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const defaultConfig = {
  updateCreatedAt: true,
  updateUpdatedAt: true,
  createUUID: true,
};

exports = module.exports = (config) => (req, res) => {
  config = Object.assign({}, defaultConfig, config);
  const body = req.body

  if (utils.isValid(config.schema, body, res) === false) return;
  
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
    TableName: config.tableName,
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
      TableName: config.tableName,
      Item: body,
    })
    .promise();
  })
	.then(() => {
    console.log(`${config.type} created.`);
    const key = {
      [config.hash]: body[config.hash],
    };

    if (config.range)
      key[config.range] = body[config.range];

		res.status(200).json(key);
	})
	.catch(error => {
		console.log(error.message);
		res.status(400).json({
      name: error.name,
      message: error.message,
    });
	});
}
