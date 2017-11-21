'use strict';

const Joi = require('joi');
const crypto = require('crypto');
const uuid = require('uuid');
const get = require('lodash/get');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const TABLE_NAME = process.env.USERS_TABLE_NAME;
const TEN_MINUTES_IN_MS = 1000 * 60 * 10;

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
});

exports = module.exports = (req, res) => {
  const body = req.body;

  if (utils.isValid(schema, body, res) === false) return;

  const email = body.email;

  let user, forgotPasswordCode;

  dynamo.get({
    TableName: TABLE_NAME,
    Key: { email },
  })
    .promise()
    .then((data) => {
      user = get(data, 'Item');
      if (user === undefined || user.email === undefined) {
        res.status(400).json({
          name: 'UserDoesNotExists',
          message: 'The specified user does not exists.',
        })
        return;
      }
      console.log('User found.');
      return uuid.v4();
    })
    .then((hash) => {
      console.log('Created forgot password code');
      forgotPasswordCode = hash;
      return dynamo.update({
        TableName: TABLE_NAME,
        Key: { email },
        UpdateExpression: 'set #fPC = :fPC, #fPCE = :fPCE',
        ExpressionAttributeNames: {
          '#fPC': 'ForgotPasswordCode',
          '#fPCE': 'ForgotPasswordCodeExpiration'
        },
        ExpressionAttributeValues: {
          ':fPC': forgotPasswordCode,
          ':fPCE': Date.now() + TEN_MINUTES_IN_MS,
        }
      }).promise();
    })
    .then((result) => {
      console.log('User updated.');
      const subject = 'CONAPPS - Recuperar Contraseña';
      return utils.sendEmail(email, subject, emailTemplate(
        subject,
        forgotPasswordCode,
        email
      ));
    })
    .then(() => {
      console.log('Email sent successfully to', email);
      res.status(202).send();
    })
    .catch(error => {
      console.log(error);
      res.status(400).json({
        name: error.name,
        message: error.message,
      })
    });
};

function emailTemplate(subject, forgotPasswordCode, email) {
  return `
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>${subject}</title>
  </head>
  <body>
    <h1>CONAPPS - Recuperar contraseña</h1>
    <p>Ingrese al siguiente link para recuperar su contraseña:</p>
    <a href="https://www.conapps.click/recoverPassword?forgotPasswordCode=${forgotPasswordCode}&email=${email}">
      https://www.conapps.click/recoverPassword?forgotPasswordCode=${forgotPasswordCode}&email=${email}
    </a>
    <p>Este codigo permanecera valido por 10 minutos.</p>
    <br />
    <br />
    <p>Contacte con el <a mailto="aws@conatel.com.uy">Administrador</a> del sistema por cualquier inconveniente.</p>
    <br />
    <p>--</p>
    <p>Administradores de Conapps</p>
  </body>
</html>
  `;
}
