'use strict';

const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const defaultConfig = {
  updateUpdatedAt: true,
};

exports = module.exports = (config) => (req, res) => {
  config = Object.assign({}, defaultConfig, config);
  const key = utils.btoj(req.params.key);
  const body = req.body

  if (utils.isValid(config.body, body, res) === false) return;
  
  if (config.updateUpdatedAt)
    body.updatedAt = Date.now();

  delete body[config.hash];
  delete body[config.range];

  const params = Object.assign({
    TableName: config.tableName,
    Key: key,
  }, buildUpdateExpressionObject(body));

  dynamo.update(params)
  .promise()
	.then(() => {
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
