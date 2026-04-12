const authService = require("../../src/services/auth.service");
const User = require("../../src/models/user.model");
const mongoose = require("mongoose");

describe("Auth Service", () => {
  const originalSecret = process.env.SECRET_KEY;

  beforeAll(async () => {
    process.env.SECRET_KEY = "test_secret";
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    process.env.SECRET_KEY = originalSecret;
  });

  describe("registerUser", () => {
    test("should register a new user successfully", async () => {
      const userData = {
        fullName: "John Doe",
        username: "johndoe123",
        email: "john@gmail.com",
        password: "password123",
      };

      const result = await authService.registerUser(userData);

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe("johndoe123");
      expect(result.user.password).toBeUndefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    test("should fail with duplicate email", async () => {
      const userData = {
        fullName: "John Doe",
        username: "johndoe123",
        email: "john@gmail.com",
        password: "password123",
      };

      await authService.registerUser(userData);

      await expect(authService.registerUser(userData)).rejects.toThrow();
    });
  });

  describe("loginUser", () => {
    test("should login with valid credentials", async () => {
      const userData = {
        fullName: "John Doe",
        username: "johndoe123",
        email: "john@gmail.com",
        password: "password123",
      };

      await authService.registerUser(userData);

      const result = await authService.loginUser({
        email: "john@gmail.com",
        password: "password123",
      });

      expect(result.user.username).toBe("johndoe123");
      expect(result.accessToken).toBeDefined();
    });

    test("should fail with invalid credentials", async () => {
      await expect(
        authService.loginUser({
          email: "nonexistent@gmail.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow();
    });
  });
});
