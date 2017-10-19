'use strict';

const Joi = require('joi');
const utils = require('../modules/utils.js');

const defaultOptions = {
  limit: 10,
};

exports = module.exports = (keySchema) => (next) => (
  event,
  context,
  callback
) => {
  const query = event.queryStringParameters || {};
  
  const schema = Joi.object().keys({
    limit: Joi.number().max(100),
    offset: keySchema,
  });

  try {
    if (query.limit)
      query.limit = parseInt(query.limit, 10);
    if (query.offset)
      query.offset = utils.btoj(query.offset);
  } catch (err) {
    console.log(err.message);
    callback(null, utils.createResponse(400, err));
  }

  const options = Object.assign({}, defaultOptions, query);
  
  event.options = options;

  if (utils.isValid(schema, options, callback) === false) return;

  next(event, context, callback);
};
