'use strict';

const nJwt = require('njwt');
const get = require('lodash/get');
const isFunction = require('lodash/isFunction.js');
const isString = require('lodash/isString.js');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const SESSIONS_TABLE_NAME = process.env.SESSIONS_TABLE_NAME;

exports = module.exports = (permission, next) => (event, context, callback) => {
  if (isFunction(next) === false)
    next = permission;
  
  const unauthorized = unauthorizedResponse(callback);
  
  let token, tokenArray;
  
  try {
    token = event.headers.Authorization.split(' ');
  } catch(err) {
    console.log(err.message);
    return unauthorized();
  }
  
  if (token[0] !== 'Bearer') {
    console.log(token[0]);
    console.log('Invalid token. No "Bearer".');
    return unauthorized();
  }

  try {
    tokenArray = token[1].split('.');
  } catch(err) {
    console.log(err.message);
    return unauthorized();
  }

  if (tokenArray.length !== 3) {
    console.log('Wrong split length');
    console.log(token);
    return unauthorized();
  }

  const body = utils.btoj(tokenArray[1]);

  if (!body || !body.jti) {
    console.log('No jti value found');
    return unauthorized();
  }

  dynamo.get({
    TableName: SESSIONS_TABLE_NAME,
    Key: {
      jti: body.jti,
    }
  })
  .promise()
  .then((data) => {
    if (!data || !data.Item || !data.Item.jti) {
      throw new utils.UnauthorizedError();
    }
    console.log('Session found.');
    return new Promise((resolve, reject) => {
      nJwt.verify(token[1], data.Item.key, (err, verifiedJwt) => {
        if (err) 
          reject(err);
        resolve(verifiedJwt);
      });
    });
  })
  .then((verifiedJwt) => {
    console.log('Token verified');
    const permissions = get(verifiedJwt, 'body.permissions', []);

    if (isString(permission) && permissions.indexOf(permission) === -1) {
      console.log(permissions);
      unauthorized(`User does not have the ${permission} permission.`);
      return;  
    }

    event.user = {
      ID: get(verifiedJwt, 'body.jti'),
      username: get(verifiedJwt, 'body.username'),
      email: get(verifiedJwt, 'body.email'),
      permissions,
    };
    next(event, context, callback);
  })
	.catch(err => {
    console.log(err.message);
    unauthorized(err.message);
	});
};

function unauthorizedResponse(callback) {
  return function(message) {
    callback(null, utils.createResponse(
      401,
      new utils.UnauthorizedError(message)
    ));
  }
}
