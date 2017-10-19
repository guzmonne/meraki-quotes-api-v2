'use strict';

const responseHandler = require('../modules/createResponseHandler.js')('/merakiDevices');

responseHandler.rest();

exports.handler = (event, context, callback) => {
  responseHandler.respond(event, context, callback);
};
