'use strict';

const utils = require('../modules/utils.js');
const dynamo = require('../modules/aws.js').DynamoDB;

exports = module.exports = (config) => (req, res) => {
  const query = req.query;
  
  const params = {
    TableName: config.tableName,
    Limit: query.limit,
  }

  if (config.attributesToGet)
    params.AttributesToGet = config.attributesToGet;

  if (query.offset) 
    params.ExclusiveStartKey = query.offset;

  dynamo.scan(params)
  .promise()
  .then((data) => {
    console.log(`Got ${config.plural || config.type + 's'} list.`);
    res.status(200).json(data.Items)
  })
  .catch(error => {
    console.log(error.message);
    res.status(400).json({
      name: error.name,
      message: error.message,
    })
  });
}
