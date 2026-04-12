const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });

exports.generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.SECRET_KEY);
