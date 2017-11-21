const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());

app.use(cors());

app.use('/v1', require('./v1.js'));

// Export your Express configuration so that it can be consumed by the Lambda // handler
module.exports = app
