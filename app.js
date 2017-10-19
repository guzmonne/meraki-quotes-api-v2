var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post('/users/login', require('./users/logins.js'));

// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
