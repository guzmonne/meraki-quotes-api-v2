'use strict';

const AWS = require('aws-sdk');
const Joi = require('joi');
const get = require('lodash/get');
const crypto = require('crypto');

const SES = new AWS.SES();

exports.createResponse = (statusCode, body) => ({
	statusCode, 
	body: JSON.stringify(body),
});

exports.isValid = (schema, object, res) => {
  const result = Joi.validate(object, schema);

	if (result.error) {
		console.log(result.error.name);
		let error = {
			name: result.error.name,
			details: result.error.details.map(error => {
				console.log('Message:', error.message);
				console.log('Path:', error.path);
				console.log('Value', get(object, error.path));
				return {
					message: error.message,
					path: error.path,
					value: get(object, error.path),
				}
			})
    };
    
    if (res) {
      res.status(400).json(error);
      return false;
    }

    return error;
  }

	return true;
};

exports.sendEmail = function(email, subject, body) {
	return new Promise((resolve, reject) => {
		let timeout = setTimeout(() => resolve(), 500);
		SES.sendEmail({
			Source: 'no-reply@conapps.click',
			Destination: { ToAddresses: [email] },
			Message: { 
				Subject: { Data: subject },
				Body: { Html: { Data: body } },
			},
		}, function(err, result) {
			clearTimeout(timeout);
			if (err) {
				reject(err);
				return;
			}
			resolve(result);
		});
	});
};

exports.UnauthorizedError = function (message) {
	this.name = 'Unauthorized';
	this.message = message || 'Unauthorized access.';
	this.stack = (new Error()).stack;
}

exports.IncorrectPasswordError = function (message){
	this.name = 'IncorrectPassword';
	this.message = message || 'The password is incorrect.';
	this.stack = (new Error()).stack;
}

exports.UserDoesNotExistsError = function (message){
	this.name = 'UserDoesNotExists';
	this.message = message || 'The user does not exists.';
	this.stack = (new Error()).stack;
}

exports.UserIsNotVerifiedError = function (message){
	this.name = 'UserIsNotVerified';
	this.message = message || 'The user has not verified its email.';
	this.stack = (new Error()).stack;
}

exports.ElementExistsError = function(type, key) {
  this.name = 'ElementExists';
  this.message = `${type} already exists`;
  this.stack = (new Error()).stack;
  this.key = key;
}

exports.ElementDoesNotExistsError = function(type, key) {
  this.name = 'ElementDoesNotExists';
  this.message = `${type} does not exists`;
  this.stack = (new Error()).stack;
  this.key = key;
}

function UnexpectedInputError(message) {
	this.name = 'UnexpectedInput';
	this.message = message || 'The encoded string is not a valid base64 string.';
	this.stack = (new Error()).stack;
}

exports.btoj = function(encodedString) {
  try {
    return JSON.parse(new Buffer(encodedString, 'base64').toString("utf8"));
  } catch (err) {
    console.log('Enconded String:', encodedString);
    throw new UnexpectedInputError(err.message);
  }
}

exports.jtob = function(object) {
  try {
    return new Buffer(JSON.stringify(object), 'utf8').toString('base64')
  } catch (err) {
    console.log('Object:', object);
    throw new UnexpectedInputError(err.message);
  }
}

exports.computeHash = function (password, salt) {
	const LEN = 128;
	const ITERATIONS = 4096;
	const DIGEST = 'sha1';
	return new Promise((resolve, reject) => {
		if (arguments.length === 2) {
			crypto.pbkdf2(
				password,
				salt,
				ITERATIONS,
				LEN,
				DIGEST,
				(err, derivedKey) => {
					if (err) {
						reject(err);
						return;
					}
					resolve({
						salt,
						hash: derivedKey.toString('base64')
					});
				}
			);
		} else {
			crypto.randomBytes(LEN, function(err, salt) {
				if (err) {
					reject(err);
					return;
				}
				salt = salt.toString('base64');
				return resolve(exports.computeHash(password, salt));
			});
		}
	});
}
