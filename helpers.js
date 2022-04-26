const bcrypt = require("bcryptjs");

// function do search and returns user object  or null if not found
const findUserByEmail = function(email,database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

//generates random string
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

//generate random Id
function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

//returns usersurls
const urlsForUser = (id,urlDatabase) => {
  
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};
//checks if userid is in database
const checkIfUserIdInData = function (req, res) {
  const shortURL = req.params.shortURL;
  const userid = req.session.user_id;
  if (userid !== urlDatabase[shortURL].userID) {
    res.status(400).send("Error: You cannot delete this");
    return;
  }
};

//checks if the email is already registered
const existingEmail = (emailInput,users) => {
  for (let userid in users) {
    if (emailInput === users[userid].email) {
      return true;
    }
  }
  return false;
};

//checks if the password is already registred
const existingPassword = (passwordInput,users) => {
  for (let userid in users) {
    if (bcrypt.compareSync(passwordInput, users[userid].password)) {
      return true;
    }
  }
  return false;
};



module.exports = {findUserByEmail,generateRandomString,generateRandomId, urlsForUser,checkIfUserIdInData,existingEmail,existingPassword}