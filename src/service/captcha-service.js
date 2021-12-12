const fetch = require("node-fetch");
const {URL} = require("url");

const verifyToken = async (secretKey, token) => {
  const requestUrl = new URL("https://www.google.com/recaptcha/api/siteverify");

  requestUrl.searchParams.append("secret", secretKey);
  requestUrl.searchParams.append("response", token)

  const response = await fetch(requestUrl.href, {
    method: "POST",
  });

  const responseJson = await response.json();
  return responseJson.success;
}

module.exports = {
  verifyToken
}
