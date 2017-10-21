const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());

app.use(cors());

app.use('/users', require('./users/router.js'));

app.use(require('./middlewares/auth.js'));

app.use('/merakiDevices', require('./merakiDevices/router.js'));

app.use('/merakiQuotes', require('./merakiQuotes/router.js'));

app.use((req, res) => {
  res.status(404).json({
    name: 'NotFound',
    message: 'Endpoint not found'
  })
})

// Export your Express configuration so that it can be consumed by the Lambda // handler
module.exports = app
