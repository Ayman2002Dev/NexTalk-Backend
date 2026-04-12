const messageService = require("../../src/services/message.service");
const Message = require("../../src/models/message.model");
const mongoose = require("mongoose");

describe("Message Service", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  beforeEach(async () => {
    await Message.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("saveMessage", () => {
    test("should save a message successfully", async () => {
      const senderId = new mongoose.Types.ObjectId();
      const receiverId = new mongoose.Types.ObjectId();

      const result = await messageService.saveMessage({
        senderId,
        receiverId,
        message: "Hello!",
      });

      expect(result._id).toBeDefined();
      expect(result.message).toBe("Hello!");
      expect(result.messageStatus).toBe("sent");
    });
  });

  describe("getChatHistory", () => {
    test("should return messages between two users", async () => {
      const userA = new mongoose.Types.ObjectId();
      const userB = new mongoose.Types.ObjectId();

      await Message.create([
        { senderId: userA, receiverId: userB, message: "Hi" },
        { senderId: userB, receiverId: userA, message: "Hello" },
      ]);

      const messages = await messageService.getChatHistory(userA, userB);

      expect(messages.length).toBe(2);
    });
  });

  describe("markAsRead", () => {
    test("should mark messages as read", async () => {
      const senderId = new mongoose.Types.ObjectId();
      const receiverId = new mongoose.Types.ObjectId();

      await Message.create({
        senderId,
        receiverId,
        message: "Unread message",
        messageStatus: "delivered",
      });

      await messageService.markAsRead(senderId, receiverId);

      const updated = await Message.findOne({ senderId, receiverId });
      expect(updated.messageStatus).toBe("read");
    });
  });
});
