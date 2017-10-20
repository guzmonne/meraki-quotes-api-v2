'use strict';

const isEmpty = require('lodash/isEmpty.js');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

exports = module.exports = (config) => (req, res) => {
  const key = utils.btoj(req.params.key);

  if (utils.isValid(config.key, key, res) === false) return;

  const params = {
    TableName: config.tableName,
    Key: key
  };

  if (config.attributesToGet)
    params.AttributesToGet = config.attributesToGet;

  dynamo.get(params).promise()
  .then(data => {
    if (isEmpty(data.Item)) {
      console.log(`${config.type} with the following key does not exists.`)
      console.log(key);
      throw new utils.ElementDoesNotExistsError(config.type, key);      
    }
    console.log(`${config.type} found.`);
    res.status(200).json(data.Item);
  })
	.catch(error => {
		console.log(error.message);
		res.status(400).json({
      name: error.name,
      message: error.message,
    });
	});
};
