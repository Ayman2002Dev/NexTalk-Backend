const mongoose = require("mongoose");
const User = require("../../src/models/user.model");

describe("User Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should create a valid user", async () => {
    const userData = {
      fullName: "John Doe",
      username: "johndoe123",
      email: "john@gmail.com",
      password: "hashedpassword123",
    };
    const user = new User(userData);
    const saved = await user.save();
    expect(saved._id).toBeDefined();
    expect(saved.fullName).toBe("John Doe");
    expect(saved.presenceStatus).toBe("offline");
  });

  test("should fail with username less than 6 characters", async () => {
    const user = new User({
      fullName: "John Doe",
      username: "john",
      email: "john@gmail.com",
      password: "password123",
    });
    await expect(user.save()).rejects.toThrow();
  });

  test("should fail with non-gmail email", async () => {
    const user = new User({
      fullName: "John Doe",
      username: "johndoe123",
      email: "john@yahoo.com",
      password: "password123",
    });
    await expect(user.save()).rejects.toThrow();
  });
});
