const messageService = require("../services/message.service");

exports.sendMessage = async (req, res) => {
  try {
    const msg = await messageService.saveMessage({
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      message: req.body.message,
    });

    return res.status(201).json(msg);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await messageService.getChatHistory(
      req.user.id,
      req.params.userId,
    );

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await messageService.markAsRead(req.params.senderId, req.user.id);
    return res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
