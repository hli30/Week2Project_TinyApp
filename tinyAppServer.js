const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

//Middleware setups
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Handle GET Requests
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Handle POST Requests
app.post("/urls", (req, res) => {
  let uid = generateRandomString();
  urlDatabase[uid] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${uid}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});