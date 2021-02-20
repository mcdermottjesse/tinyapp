const request = require('request');

function findUserByEmail(email, usersdb) {
  let usersObj = {};

  for (let user in usersdb) {

    if (usersdb[user].email === email) {
      usersObj = usersdb[user];s
      return usersObj;
    }
  }
};

function emailExists(email, users) { // helper function
  for (let user in users) {
    if (users[user].email === email) {

      return true;
    }
  }
  return false;
};

function urlsForUser(id, urldb) {
  const urlObj = {};

  for (let urlshort in urldb) {
    if (urldb[urlshort].userID === id) {
      urlObj[urlshort] = urldb[urlshort];
    }
  }
  return urlObj;
};

function generateRandomString(num) {
  let ranChars = '';
  let letrNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
  for (let i = 0; i < num; i++) {
    ranChars += letrNum.charAt(Math.floor(Math.random() * letrNum.length));

  }
  return ranChars;
};

module.exports = { findUserByEmail, emailExists, urlsForUser, generateRandomString };
