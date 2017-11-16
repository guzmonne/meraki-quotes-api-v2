'use strict';

const Joi = require('joi');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const defaultConfig = {
  updateUpdatedAt: true,
};

exports = module.exports = (config) => (req, res) => {
  config = Object.assign({}, defaultConfig, config);

  const validationResult = Joi.validate(req.body, config.body);

  if (validationResult.error !== null) {
    res.status(400).json(validationResult.error);
    return;
  }

  let key,
      body = validationResult.value;

  try {
    key = utils.btoj(req.params.key);    
  } catch (error) {
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
    return;
  }
  
  if (config.updateUpdatedAt)
    body.updatedAt = Date.now();

  delete body[config.hash];
  delete body[config.range];
  delete body.createdAt;

  console.log(body);

  const params = Object.assign({
    TableName: config.tableName,
    Key: key,
  }, buildUpdateExpressionObject(body));

  dynamo.update(params)
  .promise()
	.then((data) => {
    console.log(`${config.type} updated.`);
    res.status(202).send();
	})
	.catch(error => {
		console.log(error.message);
		res.status(400).json({
      name: error.name,
      message: error.message,
    });
	});
};

function buildUpdateExpressionObject(body) {
  return Object.keys(body).reduce((acc, key, i) => {
    if (i > 0) 
      acc.UpdateExpression += ', ';
    acc.UpdateExpression += `#${key} = :${key}`;
    
    acc.ExpressionAttributeNames[`#${key}`] = key;
    acc.ExpressionAttributeValues[`:${key}`] = body[key];
    return acc;
  }, {
    UpdateExpression: 'set ',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  });
}
