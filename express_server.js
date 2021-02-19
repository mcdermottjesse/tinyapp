const express = require("express");
const morgan = require('morgan')
const cookieSession = require('cookie-session');;
const bcrypt = require('bcryptjs')
// we need cookies so subsequent http requests can be associated with prev requests 
//via the value stored on browser
//as http itself is stateless
const app = express();
const bodyParser = require("body-parser"); //for form values
const PORT = 8080; // default port 8080

//Middleware

app.use(bodyParser.urlencoded({ extended: true })); //replaces JSON.parse
app.use(morgan('dev'))

app.use(cookieSession({
name: 'user',
keys: ['key 1', 'key 2']

}));

const plaintext = "1234"

app.set("view engine", "ejs");


 const hashed = bcrypt.hashSync(plaintext, 10)
    console.log(hashed);



//const { findUserID } = require('/helpers.js');

function generateRandomString() {
  let ranChars = '';
  let letrNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";

  for (let i = 0; i < 6; i++) {
    ranChars += letrNum.charAt(Math.floor(Math.random() * letrNum.length));

  }
  return ranChars;
};

/*function emailExists(email) { // helper function
  for (let user in users) {
    if (users[user].email === email) {

      return true;
    }
  }
  return false;
}; */

function passwordValid(inputPassword, storedPassword) {
  
    if (bcrypt.compareSync(inputPassword, storedPassword)) {
     
      return true;
    }
  
  return false;
};

function findUserID(email, usersdb) {
  
  for (let user in users) {

    if (users[user].email === email) {
      
    
      return users[user]
    }
  }
  return null
}


function urlsForUser(id, urldb) {
  const urlObj = {};

  for (let urlshort in urldb) {
    if (urldb[urlshort].userID === id) {
      urlObj[urlshort] = urldb[urlshort]
    }
  }
  return urlObj
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
    email: "user@example.com",
    password: "$2b$10$xecpVIvaXwHZN5l.vFIuruv3QffmyI/oi3NtwjrlgfRTq6.X265t."
  }
};


app.get("/urls/new", (req, res) => { //GET retrieves info

  const id = req.session.user_id //cookie session layout
  const user = users[id]
  if (user) {
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
  const id = req.session.user_id 
  const user = users[id]
  console.log("prining users", users)

  if (id) {
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
  const id = req.session.user_id
  
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: id
  }
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
  
});


app.get("/register", (req, res) => {
 
  res.render("urls_register");
});


app.post('/register', (req, res) => {
  const id = generateRandomString();
  req.session.user_id = id
  const email = req.body.email
  const password = bcrypt.hashSync(req.body.password, 10)

      users[id] = {
        id,
        email,
        password
      };

      console.log("users here" , users)
      res.redirect('/urls');
    });

  

app.get("/login", (req, res) => {

  res.render("urls_login");
});

app.post('/login', function (req, res) {
  const email = req.body.email
  
  const password = req.body.password
  const foundUser = findUserID(email)
  
 
  const authUser = passwordValid(password, foundUser.password)
  
  const userID = foundUser.id
  
  

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

  const id = req.session.user_id //cookie session layout
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL]
  const user = users[id]
  if (user) {
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

app.post("/urls/:shortURL", (req, res) => { 
  let shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = req.body.longURL //body reps data in the specific form
  res.redirect(`/urls/${shortURL}`);
});



app.get("/", (req, res) => { // "/" home page
  
});

app.post("/urls/:shortURL/delete", (req, res) => { //accesses delete action from form tag
  const id = req.session.user_id
  const user = users[id]
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

