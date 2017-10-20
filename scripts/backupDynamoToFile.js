'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const db = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1'
});

const TABLES = [
  'ConappsUsers',
  'ConappsMerakiQuotes',
  'ConappsMerakiDevices',
  'ConappsHelpers',
];

const TABLE_PROMISES = TABLES.map(table => () => new Promise((res, rej) => {
  console.log('Running scan for table:', table);
  db.scan({
    TableName: table,
  })
  .promise()
  .then(data => {
    const fileName = path.resolve(__dirname, `${table}.json`);
    const content = JSON.stringify(data.Items, null, 2);
    fs.writeFile(fileName, content, 'utf8', (err) => {
      if (err) return rej(err);
      console.log('Done writting data to file.');
      res(table);
    })
  })
  .catch(err => {
    console.log(err.name);
    console.log(err.message);
    console.log(err.stack);
    rej(err)
  });
}));

const generator = (array, i=0) => () => array[i++]; 

const until = (arrayOfPromises) => {
  var gen = generator(arrayOfPromises);

  function recursive(promise) {
    console.log('Running new promise.');
    promise().then((data) => {
      var promise = gen();

      if (promise) return recursive(promise);
      
      console.log('Finished all promises');
      
      return;
    }).catch(err => {
      console.log(err.name);
      console.log(err.message);
      console.log(err.stack);
    });
  }

  recursive(gen());
}

until(TABLE_PROMISES);
