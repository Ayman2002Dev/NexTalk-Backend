const {
  registerSchema,
  loginSchema,
} = require("../../src/schemas/auth.schema");

describe("Auth Schema Validation", () => {
  describe("registerSchema", () => {
    test("should pass valid registration data", () => {
      const data = {
        fullName: "John Doe",
        username: "johndoe123",
        email: "john@gmail.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should fail with username less than 6 characters", () => {
      const data = {
        fullName: "John Doe",
        username: "john",
        email: "john@gmail.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    test("should fail with non-gmail email", () => {
      const data = {
        fullName: "John Doe",
        username: "johndoe123",
        email: "john@yahoo.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    test("should fail when password matches username", () => {
      const data = {
        fullName: "John Doe",
        username: "password123",
        email: "john@gmail.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    test("should fail when password matches email local part", () => {
      const data = {
        fullName: "John Doe",
        username: "johndoe123",
        email: "john@gmail.com",
        password: "john",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    test("should pass valid login data", () => {
      const data = {
        email: "john@gmail.com",
        password: "password123",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should fail with missing email", () => {
      const data = { password: "password123" };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    test("should fail with missing password", () => {
      const data = { email: "john@gmail.com" };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
