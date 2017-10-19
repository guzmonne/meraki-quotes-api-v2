'use strict';

const responseHandler = require('../modules/createResponseHandler.js')('/merakiQuotes');

responseHandler.rest();

exports.handler = (event, context, callback) => {
  responseHandler.respond(event, context, callback);
};
