'use strict';

const csv = require('csvtojson'),
      path = require('path'),
      omitBy = require('lodash/omitBy.js'),
      isEmpty = require('lodash/isEmpty.js'),
      get = require('lodash/get'),
      isString = require('lodash/isString'),
      AWS = require('aws-sdk'),
      Rx = require('rxjs');

AWS.config.region = 'us-east-1';

const db = new AWS.DynamoDB.DocumentClient();

const FILE_NAME = process.argv[2],
      INTERVAL = 1000 / 5;

const items = [];

function logError(error) {
  console.log('Error!!!\n========\n');
  console.log('Name:', error.name);
  console.log('Message:', error.message);
  console.log('Stack:\n', error.stack);
}

csv()
  .fromFile(path.resolve(__dirname, FILE_NAME))
  .on('json', (json) => {
    json = omitBy(json, isEmpty);
    items.push(json);
    console.log(json);
  })
  .on('done', (error) => {
    if (error) {
      logError(error);
      return;
    }

    Rx.Observable.interval(INTERVAL)
      .startWith(-1)
      .map(i => items[i + 1])
      .map(item => {
        let Price = get(item, 'Price', '0');
        if (isString(Price)) {
          Price = Price.replace('.00', '');
          Price = Price.replace(',', '');
          Price = parseFloat(Price, 10);
        }
        return Object.assign(item, {Price});
      })
      .do(({PartNumber, Category, Description, Price}) => (
        console.log([PartNumber, Category, Description, Price].join('\t'))
      ))
      .mergeMap((Item) => {
        if (!get(Item, 'Category') || !get(Item, 'PartNumber'))
          return Rx.Observable.of(undefined); 

        return Rx.Observable.fromPromise(
          db.put({
            TableName: 'ConappsMerakiDevices',
            Item,
          }).promise()
        );
      })
      .scan((index) => index += 1, 0)
      .subscribe(
        (index) => console.log(`Item #${index} done.`),
        logError,
        () => console.log('DONE\n====\n')
      );
  });
