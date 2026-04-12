const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../src/utils/token.utils");
const jwt = require("jsonwebtoken");

describe("Token Utils", () => {
  const SECRET_KEY = "test_secret";
  process.env.SECRET_KEY = SECRET_KEY;

  describe("generateAccessToken", () => {
    test("should generate valid JWT token", () => {
      const payload = { id: "123", username: "john" };
      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      const decoded = jwt.verify(token, SECRET_KEY);
      expect(decoded.id).toBe("123");
    });

    test("should have 1 day expiration", () => {
      const payload = { id: "123" };
      const token = generateAccessToken(payload);
      const decoded = jwt.verify(token, SECRET_KEY);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(86400);
    });
  });

  describe("generateRefreshToken", () => {
    test("should generate valid JWT token without expiration", () => {
      const payload = { id: "123" };
      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      const decoded = jwt.verify(token, SECRET_KEY);
      expect(decoded.id).toBe("123");
    });
  });
});
