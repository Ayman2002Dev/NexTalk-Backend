jest.mock("../../src/services/message.service", () => ({
  saveMessage: jest.fn(),
  getChatHistory: jest.fn(),
  markAsRead: jest.fn(),
}));

const messageService = require("../../src/services/message.service");
const {
  sendMessage,
  getHistory,
  markRead,
} = require("../../src/controllers/message.controller");

describe("Message Controller", () => {
  describe("sendMessage", () => {
    test("should return 201 with valid message", async () => {
      const req = {
        user: { id: "sender123" },
        body: {
          receiverId: "receiver123",
          message: "Hello!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      messageService.saveMessage.mockResolvedValue({
        _id: "msg123",
        message: "Hello!",
        messageStatus: "sent",
      });

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getHistory", () => {
    test("should return 200 with messages array", async () => {
      const req = {
        user: { id: "user123" },
        params: { userId: "user456" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      messageService.getChatHistory.mockResolvedValue([]);

      await getHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([]));
    });
  });
});
