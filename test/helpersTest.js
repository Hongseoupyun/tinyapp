const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const actualUserID = user.id
    const expectedUserID = "userRandomID";
    assert.equal(actualUserID,expectedUserID)
    
  });
});
describe('findUserByEmail', function() {
  it('should return undefined with email not in our database', function() {
    
    const actualemail = findUserByEmail("hello@lighthouse.com",testUsers)
    const expected = undefined;
    assert.equal(actualemail,expected)
    
  });
});


//If we pass in an email that is not in our users database, then our function should return undefined. Let's write a test to confirm this functionality.
//Inside the same describe statement, add another it statement to test that a non-existent email returns undefined.
//.equal(actual, expected, [message])