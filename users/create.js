'use strict';

const Joi = require('joi');
const crypto = require('crypto');
const uuid = require('uuid');
const dynamo = require('../modules/aws.js').DynamoDB;
const utils = require('../modules/utils.js');

const TABLE_NAME = process.env.USERS_TABLE_NAME;
const schema = Joi.object().keys({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
	username: Joi.string().min(3).required(),
});


exports = module.exports = (req, res) => {
	const body = req.body;

  if (utils.isValid(schema, body, res) === false) return;

	const email = body.email;
	const clearPassword = body.password;
	const username = body.username;

	computeHash(clearPassword)
	.then(data => {
		console.log('Salt and Hash created.');
		const salt = data.salt;
		const hash = data.derivedKey;
		return storeUser(email, hash, salt, username);
	})
	.then(token => {
		console.log('Created user.');
		return sendVerificationEmail(email, clearPassword, token);
	})
	.then(() => {
		console.log('Verification email sent.');
		res.status(201).send();
	})
	.catch(error => {
    console.log(error.message);
    res.status(400).json({
      name: error.name,
      messag: error.message,
    });
	});
};

function emailTemplate(data) {
	return `
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<title>${data.subject}</title>
	</head>
	<body>
		<h1>¡Bienvenido a ConApps!</h1>
		<br />
		<p>Por favor acceda al siguiente link para habilitar su cuenta:</p>
		<br />
		<p><a href="${data.verificationLink}">${data.verificationLink}</a></p>
		<br />
		<br />
		<p>Sus credenciales de acceso son las siguientes:</p>
		<p>
			<dt>Usuario:</dt>
			<dd>${data.email}</dd>
			<dt>Contraseña:</dt>
			<dd>${data.password}</dd>
		</p>
		<br />
		<p>Procure cambiar esta contraseña cuanto antes.</p>
		<br />
		<p>Muchas Gracias</p>
		<p>--</p>
		<p>Administradores de Conapps</p>
	</body>
</html>
`
}

function sendVerificationEmail(email, password, token) {
	const subject = 'Bienvenido a Conapps.';
	const url = process.env.ROOT_URL;
	const endpoint = 'verify';
	const encodedEmail = encodeURIComponent(email);
	const verificationLink = (
		`${url}/${endpoint}?email=${encodedEmail}&verifyToken=${token}`
	);
	const body = emailTemplate({
		subject,
		verificationLink,
		email,
		password,
	});
	return utils.sendEmail(email, subject, body);
}

function computeHash(password) {
	const LEN = 128;
	const ITERATIONS = 4096;
	const DIGEST = 'sha1';
	return new Promise((resolve, reject) => {
		crypto.randomBytes(LEN, function(err, salt) {
			if (err) {
				console.log('Error in randomBytes:', err.message);
				reject(err);
				return;
			}
			salt = salt.toString('base64');
			crypto.pbkdf2(
				password,
				salt,
				ITERATIONS,
				LEN,
				DIGEST,
				(err, derivedKey) => {
				if (err) {
					console.log('Error in pbkdf2:', err.message);
					reject(err);
				}
				resolve({
					salt,
					derivedKey: derivedKey.toString('base64')
				});
			});
		});
	});
}

function storeUser(email, password, salt, username) {
	const LEN = 128;
	return new Promise((resolve, reject) => {
		crypto.randomBytes(LEN, function(err, token) {
			if (err) {
				console.log('Error on randomBytes', err.message);
				reject(err);
				return;
			}
			token = token.toString('hex');
			const now = Date.now();
			dynamo.put({
				TableName: TABLE_NAME,
				Item: {
					email,
					username,
					passwordHash: password,
					passwordSalt: salt,
					verified: false,
					verifyToken: token,
					permissions: [],
					ID: uuid.v4(),
					createdAt: now,
					updatedAt: now,
				}
			}).promise()
			.then(data => resolve(token))
			.catch(err => {
				console.log('Error while creating a user', err);
				reject(err);
			});
		});
	});
}
