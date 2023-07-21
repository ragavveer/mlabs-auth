const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  console.log(authHeader); // Bearer token
  const token = authHeader.split(" ")[1];
  const public_key = `-----BEGIN PUBLIC KEY-----\n${process.env.ACCESS_TOKEN_SECRET}\n-----END PUBLIC KEY-----`;
  jwt.verify(token, public_key, (err, decoded) => {
    if (err) return res.sendStatus(403); //invalid token
    req.user = decoded.username;
    next();
  });
};

module.exports = verifyJWT;
