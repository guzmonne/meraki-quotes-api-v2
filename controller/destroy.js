'use strict';

const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

exports = module.exports = (config) => (req, res) => {
  let key
  try {
    key = utils.btoj(req.params.key);    
  } catch (error) {
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
    return;
  }

  dynamo.delete({
    TableName: config.tableName,
    Key: key,
  }).promise()
  .then(data => {
    console.log(`${config.type} deleted.`);
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
