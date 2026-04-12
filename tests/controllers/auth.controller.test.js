jest.mock("../../src/services/auth.service", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

const authService = require("../../src/services/auth.service");
const {
  register,
  login,
  logout,
} = require("../../src/controllers/auth.controller");

describe("Auth Controller", () => {
  describe("register", () => {
    test("should return 201 with valid registration", async () => {
      const req = {
        body: {
          fullName: "John Doe",
          username: "johndoe123",
          email: "john@gmail.com",
          password: "password123",
        },
        session: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      authService.registerUser.mockResolvedValue({
        user: { id: "user123", username: "johndoe123" },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    test("should return 401 with invalid credentials", async () => {
      const req = {
        body: {
          email: "nonexistent@gmail.com",
          password: "wrongpassword",
        },
        session: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      authService.loginUser.mockRejectedValue(new Error("Invalid credentials"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("logout", () => {
    test("should clear session and return success", async () => {
      const req = { session: { accessToken: "token123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await logout(req, res);

      expect(req.session).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
