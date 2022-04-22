const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { cookie, clearCookie } = require("express/lib/response");
const { use } = require("express/lib/application");
const bcrypt = require('bcryptjs');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}
function generateRandomId() {
  return Math.random().toString(36).substring(2,8);
}
const urlsForUser = (id) => {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};
const checkIfUserIdInData = function(req ,res) {
  const shortURL = req.params.shortURL;
  const userid = req.cookies["user_id"];
  if (userid !== urlDatabase[shortURL].userID) {
    res.status(400).send("Error: You cannot delete this");
    return;
  }
};

const existingEmail = (emailInput)=>{
  for (let userid in users) {
    if (emailInput === users[userid].email) {
      return true;
    }
  }
  return false;
};
const existingPassword = (passwordInput)=>{
  for (let userid in users) {
    if (bcrypt.compareSync(passwordInput, users[userid].password)) {
      return true;
    }
  }
  return false;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID" ,
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("./hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  const usersid = req.cookies["user_id"];
  const userUrls = urlsForUser(usersid);
  const templateVars = {urls: userUrls, user: users[usersid]};
 
  res.render("urls_index",templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    return res.status(400).send("The url does not exist");
  }
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const usersid = req.cookies["user_id"];
  const templateVars = { user: users[usersid]};
  res.render("urls_new", templateVars);

  
});


app.get("/urls/:shortURL", (req, res) => {
  const usersid = req.cookies["user_id"];
  if (!usersid) {
    res.status(400).send("Error: Please log in!");
    return;
  }
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID !== usersid) {
    res.status(400).send("Error: Url does not belong to you!");
    return;
  }

  const templateVars = { shortURL: shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.cookies["user_id"], user: users[usersid] };

  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (req.cookies["user_id"]) {
    urlDatabase[shortURL] = {
      longURL:longURL,
      userID:req.cookies["user_id"]
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please log in");
  }

});


app.post("/urls/:shortURL/delete",(req, res) => {
  const shortURL = req.params.shortURL;
  checkIfUserIdInData(req,res);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL",(req, res) =>{
  const shortURL = req.params.shortURL;
  checkIfUserIdInData(req,res);
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login",(req, res) => {

  const emailIn = req.body.email;
  const passwordIn = req.body.password;

  // function do search and returns user object  or null if not found
  const findUserByEmail = function(email) {
    for (let user in users) {
      if (users[user].email === email) {
        return users[user];
      }
    }
    return null;
  };
  

  if (!existingEmail(emailIn) || !existingPassword(passwordIn)) {
    
    res.status(403).send("Error!: email or password wrong");
  } else {
    
    const foundUser = findUserByEmail(emailIn);
    if (foundUser) {
      res.cookie("user_id", foundUser.id);
      res.redirect("/urls");
    }
  }
});

app.get("/logout",(req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register",(req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {

  const newemail = req.body.email;
  const newpassword = bcrypt.hashSync(req.body.password,10)
  const newid = generateRandomId();
  console.log(newpassword)
  
  if (newemail === "" || newpassword === "") {
    res.status(400).send("Error! It is empty");
  } else if (existingEmail(newemail)) {
    res.status(400).send("Error! Mail is already existing");
  } else {
    const user = { id: newid, email: newemail, password: newpassword };
    users[newid] = user;
    res.cookie("user_id", newid);
    res.redirect("/urls");
  }
});


app.get("/login",(req, res) => {
  const templateVars = { user: null };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
