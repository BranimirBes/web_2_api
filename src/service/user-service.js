const NodeCache = require("node-cache");
const tokenService = require("./token-service");
const myCache = new NodeCache({
  stdTTL: 0
});

const DEFAULT_PROFILE_IMAGE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

myCache.set(1, {
  id: 1,
  username: "pero",
  firstName: "Pero",
  lastName: "Peric",
  email: "pero.peric@gmail.com",
  profilePicture: DEFAULT_PROFILE_IMAGE,
  role: "user"
})
myCache.set("pero", 1);

myCache.set(2, {
  id: 2,
  username: "ivo",
  firstName: "Ivo",
  lastName: "Ivic",
  email: "ivo.ivic@gmail.com",
  profilePicture: DEFAULT_PROFILE_IMAGE,
  role: "user"
});
myCache.set("ivo", 2);

myCache.set(3, {
  id: 3,
  username: "marko",
  firstName: "Marko",
  lastName: "Maric",
  email: "marko.maric@gmail.com",
  profilePicture: DEFAULT_PROFILE_IMAGE,
  role: "user"
});
myCache.set("marko", 3);

myCache.set(4, {
  id: 4,
  username: "admin",
  firstName: "Admin",
  lastName: "Admni",
  email: "admin.admin@gmail.com",
  profilePicture: DEFAULT_PROFILE_IMAGE,
  role: "admin"
});
myCache.set("admin", 4);

const getUser = (id) => {
  return myCache.get(id);
}

const getByUsername = (username) => {
  const userId = myCache.get(username);
  if (userId) {
    return myCache.get(userId);
  }
  return null;
}

const userExists = (username) => {
  const user = getByUsername(username);
  return !!user;
}

const getUserProfile = (user_profile_id, token, enableBrokenAccess) => {
  const userInfo = tokenService.verifyToken(token);
  if (!userInfo) {
    return Promise.reject("Invalid token");
  }

  const user_profile = myCache.get(user_profile_id);
  if (!user_profile) {
    return Promise.reject("Profile doesnt exist");
  }

  const requestUserInfo = getByUsername(userInfo.username);
  if (requestUserInfo.role !== "admin" && user_profile.username !== requestUserInfo.username && !enableBrokenAccess) {
    return Promise.reject("Access denied");
  }

  return Promise.resolve(user_profile);
}

module.exports = {
  getUser, getByUsername, userExists, getUserProfile
}
