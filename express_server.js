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
const checkingemail = function(emailinput){
  for (let userid in users){
    if (emailinput === users[userid].email){
     
     return true
    }
  }
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
 
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  
});

app.post("/logout",(req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register",(req, res) => {
res.render("register")
});

app.post("/register", (req, res) => {

  const newemail = req.body.email;
  const newpassword = req.body.password;
  const newid = generateRandomId();
  
  users[newid]={};
  users[newid]["id"] = newid
  users[newid]["email"] = newemail;
  users[newid]["password"] = newpassword;
  res.cookie("user_id", newid);
  
  if (newemail === "" || newpassword === ""){
    res.status(400).send("Error! It is empty");
  }
  checkingemail(newemail)
  if(checkingemail(newemail)){
    res.status(400).send("Error! Mail is already existing");
  }
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

