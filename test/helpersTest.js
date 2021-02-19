const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t."
  },

  "userRandomID": {
    id: "userRandomID",
    email: "user2@example.com",
    password: "$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t."
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user2@example.com", users);
    
    const expectedOutput = user.email;


    assert.strictEqual(expectedOutput, "user2@example.com")
    

  })

  it('should return a undefined with an invalid email', function() {
    const user = findUserByEmail("user5@example.com", users);
    
    const expectedOutput = undefined;


    assert.strictEqual(expectedOutput, user)
    

  })
});