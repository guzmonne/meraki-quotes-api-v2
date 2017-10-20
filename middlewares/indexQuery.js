'use strict';

const Joi = require('joi');
const utils = require('../modules/utils.js');

const defaultQuery = {
  limit: 10,
};

exports = module.exports = (keySchema) => (req, res, next) => {
  let query = req.query || {};
  
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
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
  }

  query = Object.assign({}, defaultQuery, query);

  if (utils.isValid(schema, query, res) === false) return;

  req.query = query;

  next();
};
