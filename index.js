const express = require("express");
const app = express();
const cors = require("cors");

const loginService = require("./src/service/login-service");
const tokenService = require("./src/service/token-service");
const captchaService = require("./src/service/captcha-service");
const userService = require("./src/service/user-service");

if (process.env.ENVIRONMENT !== "production") {
  require('dotenv').config();
}

const CAPTCHA_KEYS = {
  siteKey: process.env.CAPTCHA_SITE_KEY,
  secretKey: process.env.CAPTCHA_SECRET_KEY
}

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(cors({
  origin: 'http://159.223.20.182:3000',
  optionsSuccessStatus: 200,
  methods: "GET, PUT, POST"
}));

app.get("/captchaSiteKey", function (req, res) {
  res.send({
    siteKey: CAPTCHA_KEYS.siteKey
  });
});

app.get('/', function (req, res) {
  console.log(req.socket.remoteAddress);
  if (req.socket.remoteAddress === "::1") {
    res.headers.get("Authorization") //PROBA HEADERS
    res.status(400).send();
  } else {
    res.send("Hello world!");
  }
});

app.post("/api/user/", jsonParser,  function (req, res) {
  const token = tokenService.getTokenFromHeader(req.header("Authorization"));
  const getProfileCommand = req.body;

  if (!token) {
    res.status(401).send({message: "Unauthorized"});
    return;
  }

  userService.getUserProfile(getProfileCommand.id, token, getProfileCommand.enableBrokenAccess)
    .then((profile) => {
      res.status(200).send(profile);
    })
    .catch((reason => {
      if (reason === "Invalid token") {
        res.status(401).send({message: "Unauthorized"});
        return;
      }
      res.status(403).send({message: "Forbidden"});
    }));
});

app.post("/api/login", jsonParser, function (req, res) {
  const userData = req.body;
  let error = false;
  if (userData.captchaEnabled) {
    if (!captchaService.verifyToken(CAPTCHA_KEYS.secretKey, userData.captcha)) {
      error = true;
      res.status(400).send({message: "Invalid captcha"});
    }
  }

  if (!error && userData.limitIpEnabled && loginService.ipBlocked(req.socket.remoteAddress)) {
    error = true;
    res.status(401).send({message: "Try again in 5 minutes."});
  }

  if (!error) {
    loginService.login(userData.username, userData.password).then((response) => {
      res.send(response);
    }).catch((reason) => {
      if (userData.limitIpEnabled) {
        loginService.handleBadLogin(req.socket.remoteAddress);
      }
      if (!userData.correctMessagesEnabled) {
        res.status(400).send({message: reason});
      } else {
        res.status(400).send({message: "Invalid credentials"});
      }
    })
  }
})

app.listen(8090, '159.223.20.182');
