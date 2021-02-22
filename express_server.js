const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
// we need cookies so subsequent http requests can be associated with prev requests 
//via the value stored on browser
//as http itself is stateless
const { findUserByEmail, emailExists, urlsForUser, generateRandomString } = require('./helpers.js');
const app = express();
const bodyParser = require("body-parser"); //for form values
const PORT = 8080; // default port 8080

//Middleware

app.use(bodyParser.urlencoded({ extended: true })); //replaces JSON.parse
app.use(morgan('dev'));

app.use(cookieSession({
  name: 'user',
  keys: ['key 1', 'key 2']

}));

app.set("view engine", "ejs");

function passwordValid(inputPassword, storedPassword) {

  if (bcrypt.compareSync(inputPassword, storedPassword)) {

    return true;
  }

  return false;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "seb": {
    id: "seb",
    email: "user@example.com",
    password: "$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t."
  },

  "sally": {
    id: "sally",
    email: "user2@example.com",
    password: "$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t."
  }
};

app.get("/urls/new", (req, res) => { //GET retrieves info

  const id = req.session.user_id; //cookie session layout
  const user = users[id];
  if (user) {
    const templateVars = {
      urls: urlDatabase,
      user: user
    };
    ///urls/new represents path
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {

  const id = req.session.user_id;

  const templateVars = {
    urls: urlsForUser(id, urlDatabase),
    user: users[id]
  };

  res.render("urls_index", templateVars);

});

app.post("/urls", (req, res) => {

  const id = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL,
    userID: id
  }

  res.redirect(`/urls/${shortURL}`);

});

app.get("/register", (req, res) => {

  res.render("urls_register");

});

app.post('/register', (req, res) => {
  const id = generateRandomString(6);
  req.session.user_id = id;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !req.body.password) {

    res.status(400).send("No Email or password was detected");

  } if (emailExists(email, users)) {

    res.status(400).send("Email is already registered to an account");
    
  }
  
  
  else if ((email) && (req.body.password)) {

    users[id] = {
      id,
      email,
      password
    };

    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {

  res.render("urls_login");

});

app.post('/login', function (req, res) {

  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email, users);

  if ((!email) || (!password)) {

    res.status(400).send("Bad Request");
  }

  if (!foundUser) {

    res.status(403).send("Email or password is incorrect");
  }

  const authUser = passwordValid(password, foundUser.password);
  const userID = foundUser.id;

  if (authUser) {

    req.session.user_id = userID;
    return res.redirect('/urls');
  }

  else {

    res.status(403).send("Email or password is incorrect");
  }

});

app.post('/logout', function (req, res) {

  req.session = null //clears cookies upon logout
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => { //:shortURL reps random characters in url

  if (urlDatabase[req.params.shortURL]) { //.params contains URL paramaters
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL); //redirects to long url webpage once short url has been created
  } else {

    res.status(404).send("404 Not Found");
  }
});

app.get("/urls/:shortURL", (req, res) => { //get has been accessed by edit form tag in urls_index

  const id = req.session.user_id; //cookie session layout
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const user = users[id];

  if (user === undefined) {

    res.status(404).send("You cannot access this URL as you are not logged in");

  } else if (id !== longURL.userID) {

    res.status(403).send("This URL does not belong to you");

  } else {

    const templateVars = {
      urls: urlDatabase,
      user: user,
      shortURL: shortURL,
      longURL: longURL
    };

    res.render("urls_show", templateVars);
  }

});

app.post("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL; //body reps data in the specific form
  res.redirect('/urls');

});

app.get("/", (req, res) => { // "/" home page
  res.redirect("/login")
});

app.post("/urls/:shortURL/delete", (req, res) => { //accesses delete action from form tag

  const id = req.session.user_id;
  const user = users[id];

  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } 

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

