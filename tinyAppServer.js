const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080;



const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user1RandomID"
  }
};

// Object.keys(urlDatabase)

// Object.keys --> map --> filter (reduce)

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "fdsa"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "asdf"
  }
}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

function urlsForUser(id) {
  let urlsForCurrentUser = [];
  for(let key in urlDatabase) {
    if(id === urlDatabase[key].userID) {
      urlsForCurrentUser.push(key);
    }
  }
  return urlsForCurrentUser;
}

//Middleware setups
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

/*****
 * Handle GET Requests
 *****/
//Route: home page
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
    currentUserURLs: urlsForUser(req.cookies["user_id"])
  };
  res.render("urls_index", templateVars);
});

//Route: create new page
app.get("/urls/new", (req, res) => {
  if(!users[req.cookies["user_id"]]){
    res.redirect("/login");
  } else {
    let templateVars = { user: users[req.cookies["user_id"]] }
    res.render("urls_new", templateVars);
  }
});

//Route: detail + update page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Route: register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//Route: login page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Redirect: to actual page (longURL)
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/******
 * Handle POST Requests
 ******/
//Assigns random id to longURL
app.post("/urls", (req, res) => {
  let uid = generateRandomString();
  urlDatabase[uid] = {
    shortURL: uid,
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect("/urls");
});

//Updates the longURL in database
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//Delete url from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Login and set cookie
app.post("/login", (req, res) => {
  let currentUser;
  //find the user
  for(let user in users) {
    if(users[user].email === req.body.email) {
      currentUser = users[user];
    }
  }
  //check user password + respond
  if(!currentUser) {
    res.status(403).send("Email Doesn't Exist!"); 
  } else {
    if(bcrypt.compareSync(req.body.password, currentUser.password)){
      res.cookie("user_id", currentUser.id);
      res.redirect("/urls");
    }
    else {
      res.status(403).send("Wrong Password!");
    }
  }
});

//Logout and removes cookie 
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Registers user and set cookie to radomly generated user_id
app.post("/register", (req, res) => {
  if(!req.body.email) {
    res.status(400).send("Empty Email!");
  }

  for(let user in users) {
    if(users[user].email === req.body.email) {
      res.status(400).send("Duplicate Email!");
    }
  }

  let userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});