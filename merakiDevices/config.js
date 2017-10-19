'use strict';

const Joi = require('joi');

const categories = ['Switches', 'Wireless', 'SME', 'UTM', 'Video'];

const key = {
  Category: Joi.string().valid(categories).required(),
  PartNumber: Joi.string().required(),
};

const body = {
  ID: Joi.string(),
  Description: Joi.string().required(),
  Price: Joi.number().required(),
  ImageUrl: Joi.string().uri(),
  createdAt: Joi.alternatives().try(Joi.date().timestamp(), Joi.date().iso()),
  updatedAt: Joi.alternatives().try(Joi.date().timestamp(), Joi.date().iso()),
}

exports = module.exports = {
  type: 'Meraki Device',
  hash: 'Category',
  range: 'PartNumber',
  key: Joi.object().keys(key),
  body: (
    Joi.object().keys(body).when('ID', {
      is: Joi.empty(),
      then: Joi.object().keys({
        Description: Joi.string().optional(),
        Price: Joi.number().optional(),
      })
    })
  ),
  item: Object.assign({}, key, body),
  schema: Joi.object().keys(this.item),
}
