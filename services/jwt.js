const jwt = require("jwt-simple");
const moment = require("moment");

const SECRE_KEY = "g5Rsd34jsln6zm7J893ik";

exports.createAccessToken = function (user) {
  const payload = {
    id: user._id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    createToken: moment().unix(),
    exp: moment().add(3, "hours").unix(),
  };
  return jwt.encode(payload, SECRE_KEY);
};

exports.createRefreshToken = function (user) {
  const payload = {
    id: user._id,
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, SECRE_KEY);
};

exports.decodedToken = function (token) {
  return jwt.decode(token, SECRE_KEY, true);
};
