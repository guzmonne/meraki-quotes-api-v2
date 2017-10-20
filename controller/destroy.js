'use strict';

const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

exports = module.exports = (config) => (req, res) => {
  const key = utils.btoj(req.params.key);

  if (utils.isValid(config.key, key, res) === false) return;

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
