const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.session?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

module.exports = protect;
