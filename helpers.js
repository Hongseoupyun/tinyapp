// function do search and returns user object  or null if not found
const findUserByEmail = function(email,database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};



module.exports = findUserByEmail