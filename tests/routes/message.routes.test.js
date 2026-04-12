const request = require("supertest");
const express = require("express");
const cookieSession = require("cookie-session");
const messageRoutes = require("../../src/routes/message.routes");

describe("Message Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(
      cookieSession({
        name: "session",
        secret: "test_secret",
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );
    app.use("/messages", messageRoutes);
  });

  test("POST /messages/send should return 401 without session", async () => {
    const res = await request(app)
      .post("/messages/send")
      .send({ receiverId: "123", message: "Hello" });

    expect(res.status).toBe(401);
  });
});
