const { z } = require("zod");

exports.sendMessageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  message: z.string().min(1, "Message cannot be empty"),
});
