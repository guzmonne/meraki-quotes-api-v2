'use strict';

const Joi = require('joi');

let router = require('express').Router();

const categories = [
  'Switches',
  'Wireless',
  'SME',
  'UTM',
  'Video',
  'Accessories'
];

const key = {
  Category: Joi.string().valid(categories).required(),
  PartNumber: Joi.string().required(),
};

const body = {
  ID: Joi.string(),
  Description: Joi.string(),
  Price: Joi.number().min(0),
  ImageUrl: Joi.string().uri(),
  createdAt: Joi.alternatives().try(Joi.string(), Joi.number()),
  updatedAt: Joi.alternatives().try(Joi.string(), Joi.number()),
};

router.item = Object.assign({}, key, body);

router.use(require('../controller/createController.js')({
  type: 'Meraki Device',
  key: Joi.object().keys(key),
  tableName: process.env.MERAKI_DEVICES_TABLE_NAME,
  hash: 'Category',
  range: 'PartNumber',
  body: Joi.object().keys(body),
  item: router.item,
  schema: Joi.object().keys(router.item),
}));

exports = module.exports = router;
