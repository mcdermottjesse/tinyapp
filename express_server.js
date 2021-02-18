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
app.use(morgan('dev'))
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

function emailExists(email) { // helper function
  for(let user in users) {
    if (users[user].email === email) {
     
      return true;
    }
  }
return false;
};

function passwordExists(password) {
  for(let user in users) {
    if (users[user].password === password) {
      
      return true;
    }
  }
return false;
};

function findUserID(email) {
  for(let user in users) {
    if (users[user].email === email) {
      
      return users[user].id
    }
  }
  return null
}

function urlsForUser(id, urldb) {
  const urlObj = {};

  for(let urlshort in urldb) {
    if(urldb[urlshort].userID === id) {
      urlObj[urlshort] = urldb[urlshort] 
    }
  }
return urlObj
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "password"
  }
};

const users2 = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "password"
  }
};


app.get("/urls/new", (req, res) => { //GET retrieves info
  
  const id = req.cookies["user_id"]
  const user = users[id]
  if(user) {
  const templateVars = {
    urls: urlDatabase,
    user: user
  
  };
  ///urls/new represents path
  res.render("urls_new", templateVars);
 } else {
  res.redirect('/login')
 }
});


app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"]
  const user = users[id]

  //if(urlsForUser(id, urlDatabase)) {
  if(user) {
  const templateVars = {
    urls: urlsForUser(id, urlDatabase),
    user: user
  };
  res.render("urls_index", templateVars);
} else {
  res.redirect('/register')
}
});

app.post("/urls", (req, res) => {
  const id = req.cookies["user_id"]
//if(urlsForUser(id, urlDatabase)) {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: id
  }
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
//}
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
    res.status(403).send("Email is not registered")
  } if (emailExists(req.body.email) && !passwordExists(req.body.password)) {
    res.status(403).send("Email or Password does not exist")
  }
  else {
  const userID = findUserID(req.body.email);
  res.cookie('user_id', userID);
  res.redirect("/urls")
  }
});

app.post('/logout', function (req, res) {
  
  res.clearCookie('user_id', req.body.email);
  res.redirect("/login");
})

app.get("/u/:shortURL", (req, res) => { //:shortURL reps random characters in url
  if (urlDatabase[req.params.shortURL]) { //.params contains URL paramaters
    const longURL = urlDatabase[req.params.shortURL].longURL
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
  if(user) {
  const templateVars = {
    urls: urlDatabase,
    user: user,
    shortURL: shortURL,
    longURL: longURL
  };
  res.render("urls_show", templateVars);
 } else {
   res.redirect('/login')
 } //
});


app.get("/", (req, res) => { // "/" home page
console.log("cookie is here", req.cookies["user_id"])
  res.send("Hello!");
});

app.post("/urls/:shortURL/delete", (req, res) => { //accesses delete action from form tag
  const id = req.cookies["user_id"]
  const user = users[id]
  if(user) {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
}
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

