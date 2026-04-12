const validate = require("../../src/middleware/validate.middleware");
const { z } = require("zod");

describe("Validate Middleware", () => {
  const testSchema = z.object({
    name: z.string().min(1),
  });

  test("should pass valid data and attach to req.body", () => {
    const req = { body: { name: "John" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const middleware = validate(testSchema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.name).toBe("John");
  });

  test("should return 400 for invalid data", () => {
    const req = { body: { name: "" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const middleware = validate(testSchema);
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });
});
