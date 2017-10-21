'use strict';

const dynamo = require('../modules/aws.js').DynamoDB;

exports = module.exports = (req, res) => {
  const jti = req.user.jti;

  dynamo.delete({
    TableName: process.env.SESSIONS_TABLE_NAME,
    Key: {jti}
  })
  .promise()
  .then(() => {
    console.log(`User ${req.user.username} has signed out.`);
    res.status(200).send()
  })
  .catch(error => {
    console.log(error.message);
    res.status(400).json({
      name: error.name,
      message: error.message,
    })
  })
};
