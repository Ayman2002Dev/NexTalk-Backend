const mongoose = require("mongoose");
const Message = require("../../src/models/message.model");

describe("Message Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should create a valid message", async () => {
    const mockSenderId = new mongoose.Types.ObjectId();
    const mockReceiverId = new mongoose.Types.ObjectId();

    const messageData = {
      senderId: mockSenderId,
      receiverId: mockReceiverId,
      message: "Hello, world!",
    };

    const message = new Message(messageData);
    const saved = await message.save();
    expect(saved._id).toBeDefined();
    expect(saved.message).toBe("Hello, world!");
    expect(saved.messageStatus).toBe("sent");
  });

  test("should fail with empty message", async () => {
    const mockSenderId = new mongoose.Types.ObjectId();
    const mockReceiverId = new mongoose.Types.ObjectId();

    const message = new Message({
      senderId: mockSenderId,
      receiverId: mockReceiverId,
      message: "",
    });
    await expect(message.save()).rejects.toThrow();
  });
});
