const bcrypt = require("bcrypt");

const NodeCache = require("node-cache");
const myCache = new NodeCache({
  stdTTL: 0
});

bcrypt.hash("password", 10, function (err, hash) {
  myCache.set("pero", hash);
});

bcrypt.hash("12345", 10, function (err, hash) {
  myCache.set("ivo", hash);
});

bcrypt.hash("football", 10, function (err, hash) {
  myCache.set("marko", hash);
});

bcrypt.hash("adminpassword", 10, function (err, hash) {
  myCache.set("admin", hash);
});

const checkUserPassword = (username, password) => {
  const cachePassword = myCache.get(username);
  return bcrypt.compare(password, cachePassword);
}

module.exports = {
  checkUserPassword
}
