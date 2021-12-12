const jwt = require("jsonwebtoken");

const generateToken = (username, email) => {
  return jwt.sign(
    {username: username, email: email},
    process.env.TOKEN_KEY,
    {
      expiresIn: "2h",
    }
  );
}

const verifyToken = (token) => {
  return jwt.verify(token, process.env.TOKEN_KEY);
}

const getTokenFromHeader = (authHeader) => {
  return authHeader.substring(7);
}

module.exports = {
  generateToken, verifyToken, getTokenFromHeader
}
