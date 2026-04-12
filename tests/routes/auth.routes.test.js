jest.mock("../../src/controllers/auth.controller", () => ({
  register: jest.fn((req, res) => res.status(201).json({ user: {} })),
  login: jest.fn((req, res) =>
    res.status(401).json({ message: "Invalid credentials" }),
  ),
  logout: jest.fn((req, res) =>
    res.status(200).json({ message: "Logged out successfully" }),
  ),
}));

const request = require("supertest");
const express = require("express");
const cookieSession = require("cookie-session");
const authRoutes = require("../../src/routes/auth.routes");

describe("Auth Routes", () => {
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
    app.use("/auth", authRoutes);
  });

  test("POST /auth/register should return 400 with invalid data", async () => {
    const res = await request(app).post("/auth/register").send({
      fullName: "",
      username: "ab",
      email: "invalid",
      password: "123",
    });

    expect(res.status).toBe(400);
  });

  test("POST /auth/login should return 401 with invalid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@gmail.com", password: "wrong" });

    expect(res.status).toBe(401);
  });
});
