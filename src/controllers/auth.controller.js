const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(
      req.body,
    );
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    return res.status(201).json({ user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body,
    );
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  req.session = null;
  return res.status(200).json({ message: "Logged out successfully" });
};
