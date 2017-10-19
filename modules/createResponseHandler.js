'use strict';

const path = require('path');
const utils = require('./utils.js');

const METHOD_TO_FILENAME = {
  'GET': 'show',
  'PUT': 'update',
  'DELETE': 'destroy',
};

exports = module.exports = function createResponseHandler(prefix) {
  const basePath = path.dirname(module.parent.id);

  let callback, event, key,
    restCompatible = false,
    routes = [];

  const use = (method) => (endpoint, pathToHandler) => {
    pathToHandler || (pathToHandler = '.' + endpoint);
    routes.push({
      endpoint,
      method: method,
      handler: () => {
        return require(path.resolve(basePath, pathToHandler)).handler;
      },
    });
  };

  const get = use('GET');
  const put = use('PUT');
  const post = use('POST');
  const destroy = use('DELETE');

  const rest = () => restCompatible = true;

  const respond = (event, context, callback) => {
    try {
      let apiPath = path.dirname(event.path).replace(prefix, '');

      console.log(event);
      console.log('apiPath', apiPath);
      console.log('prefix', prefix);

      if (apiPath === '/') apiPath = '';

      let route = routes.find((route) => (
        apiPath + prefix + route.endpoint === event.path &&
        route.method === event.httpMethod
      ));

      if (route) {
        route.handler()(event, context, callback);
        return;
      }
  
      if (restCompatible === true) {
        const fileName = (
          event.path === apiPath + prefix
          ? `./${event.httpMethod === 'GET' ? 'index' : 'create'}.js`
          : `./${METHOD_TO_FILENAME[event.httpMethod]}`
        );
        const filePath = path.resolve(basePath, fileName);
        require(filePath).handler(event, context, callback);
        return;
      }

      callback(null, utils.createResponse(404, {
        name: 'NotFound',
        message: 'Endpoint not found.',
      }));
    } catch (error) {
      console.log(error.name);
      console.log(error.message);
      console.log('stack: \n' + error.stack);
      callback(null, utils.createResponse(404, {
        name: 'NotFound',
        message: 'Endpoint not found.',
      }));
    }
  }

  // ---
  return Object.freeze({
    get,
    post,
    put,
    destroy,
    rest,
    respond,
  })
}
