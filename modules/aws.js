'use strict';

const AWS = require('aws-sdk');

exports = module.exports = {
	DynamoDB: new AWS.DynamoDB.DocumentClient(),
}
