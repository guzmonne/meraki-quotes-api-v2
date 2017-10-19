'use strict';

const isEmpty = require('lodash/isEmpty.js');
const utils = require('../modules/utils.js');
const fetch = require('./fetch.js');

const URL = process.env.API_URL;

describe('/users', () => {

  const username = 'example';
  const password = 'example123';
  const email = 'example@test.com';
  const key = utils.jtob({email});

/*
  describe('/login [POST]', () => {

    test('should fail if the credentials are not present', () => {
      expect.assertions(3);
      return fetch.post('/users/login')
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
      })
    });

    test('should fail if the username is not present', () => {
      expect.assertions(4);
      return fetch.post('/users/login', {email})
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe('"password" is required');
      })
    });

    test('should fail if the username is not present', () => {
      expect.assertions(4);
      return fetch.post('/users/login', {password})
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe('"email" is required');
      })
    });

    test('should succeed if the credentials are valid', () => {
      expect.assertions(3);
      return fetch.post('/users/login', {
        email: 'guzmonne@hotmail.com', 
        password: 'conatel123'
      })
      .then(response => {
        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        return response.json();
      })
      .then(json => {
        expect(!!json.token).toBe(true);
      })
    });
    
  });
*/
/*
  describe('/changePassword [POST]', () => {

    const newPassword = 'conatel123';

    test('should fail if the current password is not present', () => {
      expect.assertions(4);
      return fetch.post('/users/changePassword')
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe('"password" is required');
      })
    });

    test('should fail if the new password is not present', () => {
      expect.assertions(4);
      return fetch.post('/users/changePassword', {password})
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe('"newPassword" is required');
      })
    });

    test('should fail if the new password is too short.', () => {
      expect.assertions(4);
      return fetch.post('/users/changePassword', {password, newPassword: '123'})
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe(
          "\"newPassword\" length must be at least 8 characters long"
        );
      })
    });

    test('should succeed if the credentials are valid', () => {
      expect.assertions(4);
      return fetch.post('/users/changePassword', {password, newPassword})
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe('"newPassword" is required');
      });
    });
  });
*/

  describe('/users [POST]', () => {

/*
    test('should fail if the body is invalid', () => {
      expect.assertions(4);
      return fetch.post('/users', {username, password})
      .then(response => {
        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe('"email" is required');
      });
    });
*/
    test('should succeed if the body is valid', () => {
      expect.assertions(3);
      return fetch.post('/users', {username, password, email})
      .then(response => {
        expect(response.ok).toBe(true);
        expect(response.status).toBe(201);
        return response.text();
      })
      .then(text => {
        expect(isEmpty(text)).toBe(true);
      });
    });

  });

  describe('/users/me [GET]', () => {

    test('should return the current user if logged in', () => {
      const key = utils.jtob({email: 'example'});
      expect.assertions(6);
      return fetch.get(`/users/me`)
      .then(response => {
        expect(response.ok).toBe(true);        
        expect(response.status).toBe(200);        
        return response.json();
      })
      .then(json => {
        expect(!!json.email).toBe(true);
        expect(!!json.permissions).toBe(true);
        expect(!!json.username).toBe(true);
        expect(!!json.ID).toBe(true);
      });
    });

  });

  describe('/users [PUT]', () => {

    test('should fail to update the user if the body is invalid', () => {
      expect.assertions(3);
      return fetch.put(`/users/${key}`, {
        username: 'test',
        permissions: ['users-destroy-me'],
      })
      .then(response => {
        expect(response.ok).toBe(false);        
        expect(response.status).toBe(400);
        return response.json();
      })
      .then(json => {
        expect(json).toBe(
          '"0" must be one of [users-destroy, users-update]'
        );
      });
    });
    
    test('should update the user if the body is valid', () => {
      expect.assertions(2);
      return fetch.put(`/users/${key}`, {
        username: 'test',
        permissions: ['users-destroy'],
      })
      .then(response => {
        expect(response.ok).toBe(true);        
        expect(response.status).toBe(200);  
      })
    });

  });

  describe('/users [DELETE]', () => {

    test('should fail to delete the user if the key is invalid', () => {
      const key = utils.jtob({email: 'example'});
      expect.assertions(4);
      return fetch.destroy(`/users/${key})}`)
      .then(response => {
        expect(response.ok).toBe(false);        
        expect(response.status).toBe(400);        
        return response.json();
      })
      .then(json => {
        expect(json.name).toBe('ValidationError');
        expect(json.details[0].message).toBe("\"email\" must be a valid email");
      });
    });

    test('should delete the user if the key is valid', () => {
      expect.assertions(3);
      return fetch.destroy(`/users/${key}`)
      .then(response => {
        expect(response.status).toBe(200);        
        expect(response.ok).toBe(true);
        return response.text();
      })
      .then(text => {
        expect(isEmpty(text)).toBe(true);
      });
    });

  });

});
