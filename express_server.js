const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { cookie, clearCookie } = require("express/lib/response");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}
function generateRandomId() {
  return Math.random().toString(36).substring(2,8);
}

const existingEmail = (emailInput)=>{
  for (let userid in users){
    if (emailInput === users[userid].email){
     return true
    } 
  }
  return false
}
const existingPassword = (passwordInput)=>{
  for (let userid in users){
    if (passwordInput === users[userid].password){
     return true
    } 
  }
  return false
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

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
  
  const usersid = req.cookies["user_id"]
  const templateVars = {urls: urlDatabase, user: users[usersid]};
 
  res.render("urls_index",templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const usersid = req.cookies["user_id"]
  const templateVars = { user: users[usersid]};
  res.render("urls_new", templateVars);

  
});


app.get("/urls/:shortURL", (req, res) => {

  const usersid = req.cookies["user_id"]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies["user_id"], user: users[usersid] };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete",(req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id",(req, res) =>{
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/login",(req, res) => {

  const emailIn = req.body.email
  const passwordIn = req.body.password

  // function do search and returns user object  or null if not found
  const findUserByEmail = function(email){
    for (let user in users){
      if (users[user].email === email) {
        console.log('users[user]', users[user])
        console.log('user --> ', user)
        return users[user]
      }
    } 
    return null
 } 
  

  if (!existingEmail(emailIn) || !existingPassword(passwordIn)){
    res.status(403).send("Error!: email or password wrong")
  } else {
    
    const foundUser = findUserByEmail(emailIn)
    if(foundUser) {
      res.cookie("user_id", foundUser.id );
      res.redirect("/urls")
    }
  }
});

app.get("/logout",(req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register",(req, res) => {
  const templateVars = { user: null }
  res.render("register", templateVars)
});


app.post("/register", (req, res) => {

  const newemail = req.body.email;
  const newpassword = req.body.password;
  const newid = generateRandomId();
  
  
  if (newemail === "" || newpassword === ""){
    res.status(400).send("Error! It is empty");
  } else if(existingEmail(newemail)) {
    res.status(400).send("Error! Mail is already existing");
  } else {
    const user = { id: newid, email: newemail, password: newpassword }
    users[newid] = user
    res.cookie("user_id", newid);
    res.redirect("/urls");
  }
});


app.get("/login",(req, res) => {
  const templateVars = { user: null }
  res.render("login", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
