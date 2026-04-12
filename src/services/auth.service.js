const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token.utils");

exports.registerUser = async ({ fullName, username, email, password }) => {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    throw new Error("Email or username already in use");
  }

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ fullName, username, email, password: hash });

  const accessToken = generateAccessToken({ id: user._id, username });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, accessToken, refreshToken };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken({
    id: user._id,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.presenceStatus = "online";
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, accessToken, refreshToken };
};
