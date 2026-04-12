const jwt = require("jsonwebtoken");
const protect = require("../../src/middleware/auth.middleware");

describe("Auth Middleware", () => {
  const SECRET_KEY = "test_secret";
  process.env.SECRET_KEY = SECRET_KEY;

  test("should pass with valid token in session", () => {
    const payload = { id: "123", username: "john" };
    const token = jwt.sign(payload, SECRET_KEY);

    const req = { session: { accessToken: token } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe("123");
  });

  test("should return 401 with no token", () => {
    const req = { session: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("should return 401 with expired token", () => {
    const req = { session: { accessToken: "invalid_token" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
