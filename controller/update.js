'use strict';

const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const defaultConfig = {
  updateUpdatedAt: true,
};

exports = module.exports = (config) => (event, context, callback) => {
  config = Object.assign({}, defaultConfig, config);
  const key = utils.btoj(event.pathParameters.key);
  const body = JSON.parse(event.body || '{}');

  if (utils.isValid(config.body, body, callback) === false) return;
  
  if (config.updateUpdatedAt)
    body.updatedAt = Date.now();

  delete body[config.hash];    
  delete body[config.range];

  const params = Object.assign({
    TableName: process.env.TABLE_NAME,
    Key: key,
  }, buildUpdateExpressionObject(body));

  dynamo.update(params)
  .promise()
	.then(() => {
		console.log(`${config.type} updated.`);
		callback(null, utils.createResponse(200));
	})
	.catch(err => {
		console.log(err.message);
		callback(null, utils.createResponse(400, err));
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
