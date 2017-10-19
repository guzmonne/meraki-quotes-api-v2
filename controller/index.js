'use strict';

const utils = require('../modules/utils.js');
const dynamo = require('../modules/aws.js').DynamoDB;

exports = module.exports = (config) => (event, context, callback) => {
  const options = event.options;
  
  const params = {
    TableName: process.env.TABLE_NAME,
    Limit: options.limit,
  }

  if (config.attributesToGet)
    params.AttributesToGet = config.attributesToGet;

  if (options.offset) 
    params.ExclusiveStartKey = options.offset;

  dynamo.scan(params)
  .promise()
  .then((data) => {
    console.log(`Got ${config.type} list.`);
    callback(null, utils.createResponse(200, data.Items));
  })
  .catch(err => {
    console.log(err.message);
    callback(null, utils.createResponse(400, err));
  });
}
