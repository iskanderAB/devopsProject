const jwt = require("jsonwebtoken");
const privateKey = process.env.JWT_SECRET || process.env.JWT_KEY;

module.exports.jwtSign = async (payload) => {
  if (!privateKey) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey,
  );
};

module.exports.jwtVerify = async (token) => {
  if (!privateKey) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.verify(token, privateKey);
};
