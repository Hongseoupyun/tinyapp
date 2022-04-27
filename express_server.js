const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  generateRandomString,
  generateRandomId,
  urlsForUser,
  checkIfUserIdInData,
  existingEmail,
  existingPassword,
} = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["My name is Yun"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Redirects to login page if user is not logged in
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/urls", (req, res) => {
  const usersId = req.session.user_id;
  const userUrls = urlsForUser(usersId, urlDatabase);
  const templateVars = { urls: userUrls, user: users[usersId] };
  //If user is not logged in, sending an error
  if (!usersId) {
    res.status(400).send("Error: Please log in!");
    return;
  }

  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    return res.status(400).send("The url does not exist");
  }
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const usersId = req.session.user_id;
  const templateVars = { user: users[usersId] };
  //It shows the list of urls only when user is logged in, otherwide, redirects to /login page
  if (usersId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const usersId = req.session.user_id;
  if (!usersId) {
    res.status(400).send("Error: Please log in!");
    return;
  }
  const shortURL = req.params.shortURL;

  //It allows user to edit urls only belong to them
  if (urlDatabase[shortURL].userID !== usersId) {
    res.status(400).send("Error: Url does not belong to you!");
    return;
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.session.user_id,
    user: users[usersId],
  };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (req.session.user_id) {
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please log in");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  checkIfUserIdInData(req, res);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  checkIfUserIdInData(req, res);
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const emailIn = req.body.email;
  const passwordIn = req.body.password;
  //login process; if mail put in is existing , it gives an error, otherwise, redirect to /urls page
  if (!existingEmail(emailIn, users) || !existingPassword(passwordIn, users)) {
    res.status(403).send("Error!: email or password wrong");
  } else {
    const foundUser = findUserByEmail(emailIn, users);
    if (foundUser) {
      req.session.user_id = foundUser.id;
      res.redirect("/urls");
    }
  }
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = bcrypt.hashSync(req.body.password, 10);
  const newId = generateRandomId();

  if (newEmail === "" || req.body.password === "") {
    res.status(400).send("Error! It is empty");
  } else if (existingEmail(newEmail, users)) {
    res.status(400).send("Error! Mail is already existing");
  } else {
    const user = { id: newId, email: newEmail, password: newPassword };
    users[newId] = user;
    req.session.user_id = newId;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
