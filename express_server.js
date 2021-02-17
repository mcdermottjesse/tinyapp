const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

function generateRandomString() {
  let ranChars = '';
  let letrNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";

  for (let i = 0; i < 6; i++) {
    ranChars += letrNum.charAt(Math.floor(Math.random() * letrNum.length));

  }
  return ranChars;
};


app.use(bodyParser.urlencoded({ extended: true })); //replaces JSON.parse


app.set("view engine", "ejs");



const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
};



app.get("/urls/new", (req, res) => {
  const templateVars = {
     username: req.cookies["username"]
  }
   ///urls/new represents path
  res.render("urls_new", templateVars); //urls_new represents ejs file
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});


app.get("/u/:shortURL", (req, res) => { //:shortURL reps random characters in url
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL); //redirects to long url webpage once short url has been created
  } else {
    res.send("404 Bad Request");
  }
});

app.get("/urls/:shortURL", (req, res) => { //get has been accessed by edit form tag in urls_index
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"] 
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
  urlDatabase[shortURL] = req.body.longURL //reassigned the give shortURL to a new longURL
  res.redirect(`/urls/${shortURL}`); //req.body reps data in the specific form
});

app.post("/urls/:shortURL/delete", (req, res) => { //accesses delete action from form tag
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post('/login', function (req, res) {
  // Cookies that have not been signed
  res.cookie('username',req.body.username);
  res.redirect("/urls")
})

app.post('/logout', function (req, res) {
  // Cookies that have not been signed
  
  res.clearCookie('username',req.body.username);
  res.redirect("/urls")
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

