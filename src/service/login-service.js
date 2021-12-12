const userService = require("./user-service");
const tokenService = require("./token-service");
const passwordService = require("./password-service");

const NodeCache = require("node-cache");
const myCache = new NodeCache({
  stdTTL: 0
});

const login = async (username, password) => {
  if (!userService.userExists(username)) {
    return Promise.reject("User does not exist");
  }
  const passwordCorrect = await passwordService.checkUserPassword(username, password);
  if (passwordCorrect) {
    const user = userService.getByUsername(username);
    return {
      token: tokenService.generateToken(username, user.email),
      user: user
    };
  }

  return Promise.reject("Password is incorrect");
}

const handleBadLogin = (ipAddress) => {
  let badLoginList = myCache.get(ipAddress);
  if (!badLoginList) {
    badLoginList = [];
  }
  badLoginList.push(Date.now());
  myCache.set(ipAddress, badLoginList);
};

const FIVE_MINUTES_MILLISECONDS = 300_000;

const ipBlocked = (ipAddress) => {
  const badLoginList = myCache.get(ipAddress);
  if (!badLoginList || badLoginList === []) {
    return false;
  }

  const badLoginsLastFileMinutes = badLoginList.filter(
    badLoginDate => (Date.now() - badLoginDate) < FIVE_MINUTES_MILLISECONDS);

  return badLoginsLastFileMinutes.length === 5;
}

module.exports = {
  login, handleBadLogin, ipBlocked
};

