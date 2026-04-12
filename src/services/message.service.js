const Message = require("../models/message.model");

exports.saveMessage = async ({ senderId, receiverId, message }) => {
  const msg = new Message({ senderId, receiverId, message });
  await msg.save();
  return msg;
};

exports.getChatHistory = async (userA, userB) => {
  return Message.find({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  }).sort({ createdAt: 1 });
};

exports.markAsRead = async (senderId, receiverId) => {
  await Message.updateMany(
    { senderId, receiverId, messageStatus: { $ne: "read" } },
    { $set: { messageStatus: "read" } },
  );
};
