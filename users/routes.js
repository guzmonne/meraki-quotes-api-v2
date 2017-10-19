'use strict';

const responseHandler = require('../modules/createResponseHandler.js')('/users');

responseHandler.post('/login');

responseHandler.post('/changePassword');

responseHandler.get('/verify');

responseHandler.get('/');

responseHandler.rest();

exports.handler = (event, context, callback) => {
  responseHandler.respond(event, context, callback);
};
