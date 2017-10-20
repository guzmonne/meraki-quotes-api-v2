'use strict';

const Joi = require('joi');
const controllerCreate = require('../controller/create.js');

let router = require('express').Router();

const merakiDevicesItem = require('../merakiDevices/router.js').item;

const key = {
  UserID: Joi.string().required(),
  createdAt: Joi.alternatives().try(Joi.date().timestamp(), Joi.date().iso()),
};

const merakiQuotesDeviceSchema = Joi.object().keys(Object.assign({},
  merakiDevicesItem, 
  {
    "Intro": Joi.number().min(0).max(1).default(0).required(),
    "Qty": Joi.number().min(0).default(1).required(),
  }
));

const body = {
  AdminMargin: Joi.number().min(0).max(1),
  DealApproved: Joi.bool().default(false),
  ID: Joi.string().uuid({version: ['uuidv4', 'uuidv5']}),
  Description: Joi.string(),
  Devices: Joi.array().items(merakiQuotesDeviceSchema),
  Discount: Joi.number().min(0).max(1),
  HardwareMargin: Joi.number().min(0).max(1),
  LicenceYears: Joi.number().valid([1, 3, 5, 7, 10]),
  Name: Joi.string(),
  ServiceLevel: Joi.string().valid(['9x5xNBD', '24x7x4']),
  ServiceMargin: Joi.number().min(0).max(1),
  SoftwareMargin: Joi.number().min(0).max(1),
  UserName: Joi.string(),
  Price: Joi.number(),
  ImageUrl: Joi.string().uri(),
  updatedAt: Joi.alternatives().try(Joi.date().timestamp(), Joi.date().iso()),
};

const config = {
  type: 'Meraki Quote',
  hash: 'UserID',
  range: 'createdAt',
  key: Joi.object().keys(key),
  tableName: process.env.MERAKI_QUOTES_TABLE_NAME,
  body: Joi.object().keys(body).when('ID', {
    is: Joi.exist(),
    then: Object.keys(body)
    .filter(key => (key !== 'ID' || key !== 'Devices'))
    .reduce((acc, key) => Object.assign({}, acc, {
      [key]: body[key].required(),
    }), {})
  }),
  item: Object.assign({}, key, body),
  schema: Joi.object().keys(this.item),
  updateCreatedAt: false
};

const create = (req, res) => {
  req.body.UserID = req.user.ID,
  req.body.UserName = req.user.username,
  req.body.createdAt = (new Date()).toISOString();
  controllerCreate(config)(req, res);
}

config.handlers = {create};

router.use(require('../controller/createController.js')(config));

exports = module.exports = router;
