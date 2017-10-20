'use stict';

const Joi = require('joi');
const router = require('express').Router();
const indexQuery = require('../middlewares/indexQuery.js');

const keySchema = Joi.object().keys({
  email: Joi.string().email().required(),
})

router.get('/', indexQuery(keySchema), require('./index.js'));

router.post('/', require('./create.js'));

router.get('/:key', require('./show.js'));

router.put('/:key', require('./update.js'));

router.delete('/:key', require('./destroy.js'));

exports = module.exports = router;
