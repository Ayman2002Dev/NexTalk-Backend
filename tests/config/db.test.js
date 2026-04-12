const mongoose = require("mongoose");
const connectDB = require("../../src/config/db");

describe("Database Connection", () => {
  const originalUrl = process.env.MONGO_URL;

  beforeAll(() => {
    process.env.MONGO_URL = "mongodb://localhost:27017/nextalk_test";
  });

  afterAll(async () => {
    await mongoose.connection.close();
    process.env.MONGO_URL = originalUrl;
  });

  test("should connect to MongoDB successfully", async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
  });
});
