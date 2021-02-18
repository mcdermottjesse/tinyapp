const express = require("express");
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
// we need cookies so subsequent http requests can be associated with prev requests 
//via the value stored on browser
//as http itself is stateless
const app = express();
const bodyParser = require("body-parser"); //for form values
const PORT = 8080; // default port 8080

//Middleware

app.use(bodyParser.urlencoded({ extended: true })); //replaces JSON.parse
app.use(morgan('combined'))
app.use(cookieParser());


app.set("view engine", "ejs");

function generateRandomString() {
  let ranChars = '';
  let letrNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";

  for (let i = 0; i < 6; i++) {
    ranChars += letrNum.charAt(Math.floor(Math.random() * letrNum.length));

  }
  return ranChars;
};

function emailExists(email) {
  for(let user in users) {
    if (users[user].email === email) {
      console.log("inside true loop")
      return true
    }
  }
return false
}

function passwordExists(password) {
  for(let user in users) {
    if (users[user].password === password) {
      console.log("inside true loop")
      return true
    }
  }
return false
}

function findUserID(email) {
  for(let user in users) {
    if (users[user].email === email) {
      console.log("inside true loop")
      return users[user].id
    }
  }
  return null
}

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.ca"

};

const users = {
  userID: {
    id: "userID",
    email: "user@example.com",
    password: "password"
  }
};


app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"]
  const user = users[id]
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  ///urls/new represents path
  res.render("urls_new", templateVars); //urls_new represents ejs file
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"]
  console.log("req.cookies is here", req.cookies)
  const user = users[id]
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {

  res.render("urls_register");
});

app.post('/register', (req, res) => {
 
  if ((!req.body.email) || (!req.body.password) || emailExists(req.body.email)) {
    console.log(req.body)
    res.status(400).send("Bad Request")
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,//remember req.body contains the form data
      password: req.body.password
    };
  console.log(users[userID]);
  res.cookie('user_id', userID);
  res.redirect("/urls");
  generateRandomString();
  }
});

app.get("/login", (req, res) => {

  res.render("urls_login");
});

app.post('/login', function (req, res) {
  if (!emailExists(req.body.email)) {
    res.status(403).send("Forbidden")
  } if (emailExists(req.body.email) && !passwordExists(req.body.password)) {
    res.status(403).send("naughty")
  }
  else {
  console.log("hit req body email", req.body.email)
  const userID = findUserID(req.body.email)
  res.cookie('user_id', userID);
  res.redirect("/urls")
  }
})

app.post('/logout', function (req, res) {
  

  res.clearCookie('user_id', req.body.email);
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => { //:shortURL reps random characters in url
  if (urlDatabase[req.params.shortURL]) { //.params contains URL paramaters
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL); //redirects to long url webpage once short url has been created
  } else {
    res.status(404).send("404 Not Found");
  }
});

app.get("/urls/:shortURL", (req, res) => { //get has been accessed by edit form tag in urls_index
  const id = req.cookies["user_id"]
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL]
  const user = users[id]
  const templateVars = {
    urls: urlDatabase,
    user: user,
    shortURL: shortURL,
    longURL: longURL
  };
  res.render("urls_show", templateVars); //
});


app.get("/", (req, res) => { // "/" home page
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => { //form from urls_show accesses post within form tag
  let shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL //reassigned the given shortURL to a new longURL
  res.redirect(`/urls/${shortURL}`); //req.body reps data in the specific form
});

app.post("/urls/:shortURL/delete", (req, res) => { //accesses delete action from form tag
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

