'use strict';

let router = require('express').Router();

router.use('/users', require('./users/router.js'));

router.use(require('./middlewares/auth.js'));

router.use('/merakiDevices', require('./merakiDevices/router.js'));

router.use('/merakiQuotes', require('./merakiQuotes/router.js'));

router.use((req, res) => {
  res.status(404).json({
    name: 'NotFound',
    message: 'Endpoint not found'
  })
})

exports = module.exports = router;
