'use strict';

const Joi = require('joi');
const crypto = require('crypto');
const get = require('lodash/get');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const TABLE_NAME = process.env.USERS_TABLE_NAME;

const schema = Joi.object().keys({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
	newPassword: Joi.string().min(8).required(),
});

exports = module.exports = (req, res) =>  {
	const body = req.body;
  
  body.email = req.user.email;

  if (utils.isValid(schema, body, res) === false) return;

	const email = body.email;
	const password = body.password;
	const newPassword = body.newPassword;

	let user;

	dynamo.get({
		TableName: TABLE_NAME,
		Key: {email},
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
		return utils.computeHash(password, user.passwordSalt);
	})
	.then((result) => {
		if (result.hash !== user.passwordHash) {
			throw new utils.IncorrectPasswordError();
		}
		return utils.computeHash(newPassword);
	})
	.then((result) => {
		console.log('Calculated new salt and hash');
		return dynamo.update({
			TableName: TABLE_NAME,
			Key: {email},
			UpdateExpression: 'set #pS = :pS, #pH = :pH, #uA = :uA',
			ExpressionAttributeNames: {
				'#pS': 'passwordSalt',
				'#pH': 'passwordHash',
				'#uA': 'updatedAt',
			},
			ExpressionAttributeValues: {
				':pS': result.salt,
				':pH': result.hash,
				':uA': Date.now(),
			}
		}).promise();
	})
	.then((result) => {
		console.log('Password updated.');
		const subject = 'CONAPPS - Cambio de Contraseña';
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

function emailTemplate(subject) {
	return `
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<title>${subject}</title>
	</head>
	<body>
		<h1>CONAPPS - Contraseña actualizada correctamente</h1>
		<br />
		<p><a href="https://www.conapps.click">Acceder a CONAPPS</a></p>
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
