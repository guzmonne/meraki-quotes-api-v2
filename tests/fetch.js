'use strict';

const fetch = require('node-fetch');

const URL = process.env.API_URL;

const headers = 

exports = module.exports = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.TOKEN}`,
  },
  get: function(endpoint) {
    return fetch(URL + endpoint, {
      method: 'GET',
      headers: this.headers,
    });
  },
  post: function(endpoint, body) {
    return fetch(URL + endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })
  },
  put: function(endpoint, body) {
    return fetch(URL + endpoint, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(body),
    });
  },
  destroy: function(endpoint) {
    return fetch(URL + endpoint, {
      method: 'DELETE',
      headers: this.headers,
    });
  }
};
