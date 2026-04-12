const router = require("express").Router();
const {
  register,
  login,
  logout,
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);

module.exports = router;
