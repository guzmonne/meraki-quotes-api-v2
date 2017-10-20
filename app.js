var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post('/users/login', require('./users/login.js'));

app.get('/users/verify', require('./users/verify.js'));

app.use(require('./middlewares/auth.js'));

app.post('/users/changePassword', require('./users/changePassword.js'));

app.get('/users/me', require('./users/me.js'));

app.use('/users', require('./users/router.js'));

// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
