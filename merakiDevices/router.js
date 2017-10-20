'use strict';

const Joi = require('joi');

let router = require('express').Router();

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

router.use(require('../controller/createController.js')({
  type: 'Meraki Device',
  key: Joi.object().keys(key),
  tableName: process.env.MERAKI_DEVICES_TABLE_NAME,
  hash: 'Category',
  range: 'PartNumber',
  body: Joi.object().keys(body).when('ID', {
    is: Joi.empty(),
    then: Joi.object().keys({
      Description: Joi.string().optional(),
      Price: Joi.number().optional(),
    })
  }),
  item: Object.assign({}, key, body),
  schema: Joi.object().keys(this.item),
}));

exports = module.exports = router;
