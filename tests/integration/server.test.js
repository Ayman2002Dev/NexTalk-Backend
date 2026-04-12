const request = require("supertest");
const app = require("../../server");

describe("Server Integration", () => {
  test("should respond to health check", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
