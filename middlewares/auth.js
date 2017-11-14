'use strict';

const nJwt = require('njwt');
const get = require('lodash/get');
const isFunction = require('lodash/isFunction.js');
const isString = require('lodash/isString.js');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const SESSIONS_TABLE_NAME = process.env.SESSIONS_TABLE_NAME;

exports = module.exports = (req, res, next) => {
  const unauthorized = unauthorizedResponse(res);
  
  let token, tokenArray;
  
  try {
    token = req.headers.authorization.split(' ');
  } catch(err) {
    console.log(err.message);
    return unauthorized({
      name: 'InvalidTokenError',
      message: 'Invalid token.',
    });
  }
  
  if (token[0] !== 'Bearer') {
    return unauthorized({
      name: 'InvalidTokenError',
      message: 'Invalid token. No "Bearer".',
    });
  }

  try {
    tokenArray = token[1].split('.');
  } catch(err) {
    return unauthorized(err);
  }

  if (tokenArray.length !== 3) {
    return unauthorized({
      name: 'InvalidTokenError',
      message: 'Wrong split length',
    });
  }

  const body = utils.btoj(tokenArray[1]);

  if (!body || !body.jti) {
    return unauthorized({
      name: 'InvalidTokenError',
      message: 'No jti value found',
    });
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
        if (err) {
          reject(err);
          return;
        }
        resolve(verifiedJwt);
      });
    });
  })
  .then((verifiedJwt) => {
    console.log('Token verified');
    req.user = {
      ID: get(verifiedJwt, 'body.sub'),
      jti: get(verifiedJwt, 'body.jti'),
      username: get(verifiedJwt, 'body.username'),
      email: get(verifiedJwt, 'body.email'),
      permissions: get(verifiedJwt, 'body.permissions'),
    };
    next();
  })
	.catch(err => {
    console.log(err.message);
    unauthorized(err.message);
	});
};

function unauthorizedResponse(res) {
  return function(error) {
    console.log(error);
    res.status(401).json({
      name: error.name,
      message: error.message
    });
  }
}

/*
const permissions = get(verifiedJwt, 'body.permissions', []);
if (isString(permission) && permissions.indexOf(permission) === -1) {
  console.log(permissions);
  throw new utils.UnauthorizedError(
    `User does not have the ${permission} permission.`
  ); 
}
*/
