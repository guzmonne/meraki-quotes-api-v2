'use strict';

const Joi = require('joi');
const crypto = require('crypto');
const uuid = require('uuid');
const get = require('lodash/get');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const TABLE_NAME = process.env.USERS_TABLE_NAME;

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  forgotPasswordCode: Joi.string().required(),
});

exports = module.exports = (req, res) => {
  const body = req.body;

  if (utils.isValid(schema, body, res) === false) return;

  const password = body.password,
    email = body.email,
    forgotPasswordCode = body.forgotPasswordCode;

  let user;

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
      if (
        user.ForgotPasswordCodeExpiration > Date.now() &&
        user.ForgotPasswordCode !== forgotPasswordCode 
      )
        throw new utils.ForgotPasswordCodeMismatchError();
      return utils.computeHash(password);
    })
    .then((result) => {
      console.log('Calculated new salt and hash');
      return dynamo.update({
        TableName: TABLE_NAME,
        Key: { email },
        UpdateExpression: 'set #pS = :pS, #pH = :pH, #uA = :uA, #fPCE = :fPCE',
        ExpressionAttributeNames: {
          '#pS': 'passwordSalt',
          '#pH': 'passwordHash',
          '#uA': 'updatedAt',
          '#fPCE': 'ForgotPasswordCodeExpiration',
        },
        ExpressionAttributeValues: {
          ':pS': result.salt,
          ':pH': result.hash,
          ':uA': Date.now(),
          ':fPCE': 0,
        }
      }).promise();
    })
    .then((result) => {
      console.log('User updated.');
      const subject = 'CONAPPS - Contraseña recuperada.';
      return utils.sendEmail(email, subject, emailTemplate(subject));
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
		<h1>CONAPPS - Contraseña recuperada.</h1>
    <p>Este correo es para notificarle que su contraseña ha sido modificada con exito.</p>
    <p>Puede acceder al siguiente link para ingresar a la aplicación.</p>
    <a href="https://www.conapps.click/users/login">
      https://www.conapps.click/users/login
    </a>
    <p>Si usted no realizo el procedimiento para recuperar su contraseña comuniquese con el administrador del sistema.</p>
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
