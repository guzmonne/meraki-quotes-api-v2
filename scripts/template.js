const path = require('path');
const YAML = require('yamljs');
const fs = require('fs');
// Default stage.
let STAGE = 'Stage';
// Stage configuration through NODE_ENV global environment variable.
try {
	STAGE = (
			process.env.NODE_ENV === 'production' 
			? '' 
			: process.env.NODE_ENV[0].toUpperCase() + process.env.NODE_ENV.slice(1)
	);
} catch(err) {
	console.log('NODE_ENV is not defined. Setting stage environment.');
}

function readTemplateBase() {
  var file = 'template.base.yaml';
	fs.readFile(path.resolve(__dirname, file), 'utf-8', (err, data) => {
		if (err) {
			console.log(err);
			return;
    }    
    data = data.replace(/\${stage}/g, STAGE);
    json = YAML.parse(data)
    delete json.EnvironmentVariables;
    data = YAML.stringify(json, 8, 2);
		writeTemplate(data);
	});
}

function writeTemplate(data) {
	fs.writeFile(
		path.resolve(__dirname, 'template.yaml'),
		data,
		(err) => {
			if (err) {
				console.log(err);
				return;
			}
			console.log('Template is done.');
		}
	);
}

readTemplateBase();
