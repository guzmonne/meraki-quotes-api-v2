var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.use('/users', require('./users/router.js'));

app.use(require('./middlewares/auth.js'));

app.use('/merakiDevices', require('./merakiDevices/router.js'));

app.use((req, res) => {
  res.status(404).json({
    name: 'NotFound',
    message: 'Endpoint not found'
  })
})

// Export your Express configuration so that it can be consumed by the Lambda // handler
module.exports = app
