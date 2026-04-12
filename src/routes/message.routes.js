const router = require("express").Router();
const {
  sendMessage,
  getHistory,
  markRead,
} = require("../controllers/message.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { sendMessageSchema } = require("../schemas/message.schema");

router.use(protect);

router.post("/send", validate(sendMessageSchema), sendMessage);
router.get("/:userId", getHistory);
router.patch("/read/:senderId", markRead);

module.exports = router;
