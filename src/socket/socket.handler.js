const jwt = require("jsonwebtoken");
const Message = require("../models/message.model");
const User = require("../models/user.model");

const onlineUsers = new Map();

const setPresenceStatus = async (userId, presenceStatus) => {
  try {
    await User.findByIdAndUpdate(userId, { presenceStatus });
  } catch (error) {
    // Presence persistence should not crash the socket lifecycle.
  }
};

exports.initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      socket.user = jwt.verify(token, process.env.SECRET_KEY);
      return next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = String(socket.user.id);

    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    await setPresenceStatus(userId, "online");
    io.emit("userOnline", { userId, status: "online" });

    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("sendMessage", async ({ receiverId, message }) => {
      const savedMessage = await Message.create({
        senderId: userId,
        receiverId,
        message,
      });

      const receiverKey = String(receiverId);
      const receiverSocketId = onlineUsers.get(receiverKey);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", savedMessage);

        await Message.findByIdAndUpdate(savedMessage._id, {
          messageStatus: "delivered",
        });

        socket.emit("messageDelivered", { messageId: savedMessage._id });
      }
    });

    socket.on("messageRead", async ({ senderId }) => {
      await Message.updateMany(
        {
          senderId,
          receiverId: userId,
          messageStatus: { $ne: "read" },
        },
        { $set: { messageStatus: "read" } },
      );

      const senderSocketId = onlineUsers.get(String(senderId));
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { by: userId });
      }
    });

    socket.on("typing", ({ to }) => {
      io.to(String(to)).emit("typing", { from: userId });
    });

    socket.on("stopTyping", ({ to }) => {
      io.to(String(to)).emit("stopTyping", { from: userId });
    });

    socket.on("disconnect", async () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        await setPresenceStatus(userId, "offline");
        io.emit("userOffline", { userId, status: "offline" });
      }
    });
  });
};

exports.onlineUsers = onlineUsers;
