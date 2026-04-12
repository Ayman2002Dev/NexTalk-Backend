const { sendMessageSchema } = require("../../src/schemas/message.schema");

describe("Message Schema Validation", () => {
  test("should pass valid message data", () => {
    const data = {
      receiverId: "64abc123def456",
      message: "Hello, world!",
    };
    const result = sendMessageSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("should fail with empty message", () => {
    const data = {
      receiverId: "64abc123def456",
      message: "",
    };
    const result = sendMessageSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test("should fail with missing receiverId", () => {
    const data = {
      message: "Hello, world!",
    };
    const result = sendMessageSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
