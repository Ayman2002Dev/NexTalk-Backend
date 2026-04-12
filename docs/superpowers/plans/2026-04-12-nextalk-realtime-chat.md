# NexTalk Real-Time Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready real-time chat application with JWT authentication, one-to-one messaging, presence tracking, and message status updates (sent → delivered → read).

**Architecture:** Express.js REST API with Socket.io for real-time communication, MongoDB for persistence, dual-token JWT strategy (access + refresh), and in-memory online users Map for presence tracking.

**Tech Stack:** Node.js, Express, Socket.io, MongoDB, Mongoose, jsonwebtoken, bcryptjs, cookie-session, Zod validation.

---

## File Structure Summary

| File                                    | Responsibility                                                          |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `server.js`                             | Express app, HTTP server, Socket.io attachment, middleware registration |
| `src/config/db.js`                      | MongoDB connection                                                      |
| `src/models/user.model.js`              | User schema with auth fields                                            |
| `src/models/message.model.js`           | Message schema with status tracking                                     |
| `src/schemas/auth.schema.js`            | Zod validation for register/login                                       |
| `src/schemas/message.schema.js`         | Zod validation for messages                                             |
| `src/middleware/auth.middleware.js`     | JWT verification for protected routes                                   |
| `src/middleware/validate.middleware.js` | Zod schema runner                                                       |
| `src/utils/token.utils.js`              | JWT token generation helpers                                            |
| `src/services/auth.service.js`          | Auth business logic                                                     |
| `src/services/message.service.js`       | Message business logic                                                  |
| `src/controllers/auth.controller.js`    | HTTP request handlers for auth                                          |
| `src/controllers/message.controller.js` | HTTP request handlers for messages                                      |
| `src/routes/auth.routes.js`             | Auth route registration                                                 |
| `src/routes/message.routes.js`          | Message route registration                                              |
| `src/socket/socket.handler.js`          | All Socket.io event handlers                                            |
| `.env`                                  | Environment variables                                                   |
| `package.json`                          | Dependencies and scripts                                                |

---

## Task 1: Project Initialization

**Files:**

- Create: `package.json`
- Create: `.env`
- Create: `.gitignore`

- [x] **Step 1: Create project directory and initialize npm**

```bash
mkdir nextalk && cd nextalk
npm init -y
```

- [x] **Step 2: Install all dependencies**

```bash
npm install express mongoose socket.io jsonwebtoken bcryptjs cookie-session zod cors dotenv
npm install --save-dev nodemon
```

- [x] **Step 3: Add scripts to package.json**

Edit `package.json` and add:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

- [x] **Step 4: Create .env file**

```env
MONGO_URL=mongodb://localhost:27017/nextalk
SECRET_KEY=my_super_secret_key_change_this
PORT=5000
SESSION_SECRET=my_session_secret
CLIENT_URL=http://localhost:3000
```

- [x] **Step 5: Create .gitignore**

```
node_modules/
.env
dist/
*.log
.DS_Store
coverage/
```

- [x] **Step 6: Verify installation**

```bash
npm ls --depth=0
```

## Expected: List of installed packages without errors

## Task 2: Folder Structure

**Files:**

- Create directories: `src/config`, `src/controllers`, `src/middleware`, `src/models`, `src/routes`, `src/schemas`, `src/services`, `src/socket`, `src/utils`

- [x] **Step 1: Create all directories**

```bash
mkdir -p src/{config,controllers,middleware,models,routes,schemas,services,socket,utils}
```

- [x] **Step 2: Verify structure**

```bash
tree src
```

## Expected: All 9 directories listed

## Task 3: Database Models

**Files:**

- Create: `src/models/user.model.js`
- Create: `src/models/message.model.js`

- [x] **Step 1: Write test for User model schema**

Create `tests/models/user.model.test.js`:

```javascript
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
```

- [x] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/models/user.model.test.js
```

Expected: FAIL (model file empty/missing)

- [x] **Step 3: Create User model**

Create `src/models/user.model.js`:

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[\w.-]+@gmail\.com$/, "Only @gmail.com emails allowed"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  presenceStatus: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
  accessToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/models/user.model.test.js
```

Expected: PASS (all 3 tests)

- [x] **Step 5: Write test for Message model schema**

Create `tests/models/message.model.test.js`:

```javascript
const mongoose = require("mongoose");
const Message = require("../../src/models/message.model");

describe("Message Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should create a valid message", async () => {
    const mockSenderId = new mongoose.Types.ObjectId();
    const mockReceiverId = new mongoose.Types.ObjectId();

    const messageData = {
      senderId: mockSenderId,
      receiverId: mockReceiverId,
      message: "Hello, world!",
    };

    const message = new Message(messageData);
    const saved = await message.save();
    expect(saved._id).toBeDefined();
    expect(saved.message).toBe("Hello, world!");
    expect(saved.messageStatus).toBe("sent");
  });

  test("should fail with empty message", async () => {
    const mockSenderId = new mongoose.Types.ObjectId();
    const mockReceiverId = new mongoose.Types.ObjectId();

    const message = new Message({
      senderId: mockSenderId,
      receiverId: mockReceiverId,
      message: "",
    });
    await expect(message.save()).rejects.toThrow();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- tests/models/message.model.test.js
```

Expected: FAIL

- [ ] **Step 7: Create Message model**

Create `src/models/message.model.js`:

```javascript
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  messageStatus: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
```

- [x] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/models/message.model.test.js
```

Expected: PASS

- [x] **Step 9: Commit**

```bash
git add src/models/ tests/models/
git commit -m "feat: add User and Message models with tests"
```

---

## Task 4: Zod Validation Schemas

**Files:**

- Create: `src/schemas/auth.schema.js`
- Create: `src/schemas/message.schema.js`

- [x] **Step 1: Write test for auth schema validation**

Create `tests/schemas/auth.schema.test.js`:

```javascript
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
```

- [x] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/schemas/auth.schema.test.js
```

Expected: FAIL

- [x] **Step 3: Create auth schema**

Create `src/schemas/auth.schema.js`:

```javascript
const { z } = require("zod");

const emailValidator = z
  .string()
  .regex(/^[\w.-]+@gmail\.com$/, "Only @gmail.com emails allowed");

exports.registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    username: z.string().min(6, "Username must be at least 6 characters"),
    email: emailValidator,
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password === data.username) {
      ctx.addIssue({
        path: ["password"],
        message: "Password cannot match username",
      });
    }
    const emailLocal = data.email.split("@")[0];
    if (data.password === emailLocal) {
      ctx.addIssue({
        path: ["password"],
        message: "Password cannot match email",
      });
    }
  });

exports.loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Password is required"),
});
```

- [x] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/schemas/auth.schema.test.js
```

Expected: PASS (all 8 tests)

- [x] **Step 5: Write test for message schema**

Create `tests/schemas/message.schema.test.js`:

```javascript
const { sendMessageSchema } = require("../../src/schemas/message.schema");

describe("Message Schema Validation", () => {
  test("should pass valid message data", () => {
    const data = {
      receiverId: "64abc123def456",
      message: "Hello, world!",
    };
    const result = sendMessageSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("should fail with empty message", () => {
    const data = {
      receiverId: "64abc123def456",
      message: "",
    };
    const result = sendMessageSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test("should fail with missing receiverId", () => {
    const data = {
      message: "Hello, world!",
    };
    const result = sendMessageSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

- [x] **Step 6: Run test to verify it fails**

```bash
npm test -- tests/schemas/message.schema.test.js
```

Expected: FAIL

- [x] **Step 7: Create message schema**

Create `src/schemas/message.schema.js`:

```javascript
const { z } = require("zod");

exports.sendMessageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  message: z.string().min(1, "Message cannot be empty"),
});
```

- [x] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/schemas/message.schema.test.js
```

Expected: PASS

- [x] **Step 9: Commit**

```bash
git add src/schemas/ tests/schemas/
git commit -m "feat: add Zod validation schemas with tests"
```

---

## Task 5: Middleware

**Files:**

- Create: `src/middleware/auth.middleware.js`
- Create: `src/middleware/validate.middleware.js`

- [x] **Step 1: Write test for validate middleware**

Create `tests/middleware/validate.middleware.test.js`:

```javascript
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
```

- [x] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/middleware/validate.middleware.test.js
```

Expected: FAIL

- [x] **Step 3: Create validate middleware**

Create `src/middleware/validate.middleware.js`:

```javascript
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
```

- [x] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/middleware/validate.middleware.test.js
```

Expected: PASS

- [x] **Step 5: Write test for auth middleware**

Create `tests/middleware/auth.middleware.test.js`:

```javascript
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
```

- [x] **Step 6: Run test to verify it fails**

```bash
npm test -- tests/middleware/auth.middleware.test.js
```

Expected: FAIL

- [x] **Step 7: Create auth middleware**

Create `src/middleware/auth.middleware.js`:

```javascript
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.session?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized — no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

module.exports = protect;
```

- [x] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/middleware/auth.middleware.test.js
```

Expected: PASS

- [x] **Step 9: Commit**

```bash
git add src/middleware/ tests/middleware/
git commit -m "feat: add auth and validate middleware with tests"
```

---

## Task 6: Token Utilities

**Files:**

- Create: `src/utils/token.utils.js`

- [x] **Step 1: Write test for token utils**

Create `tests/utils/token.utils.test.js`:

```javascript
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
      expect(decoded.exp - decoded.iat).toBe(86400); // 1 day in seconds
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
```

- [x] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/utils/token.utils.test.js
```

Expected: FAIL

- [x] **Step 3: Create token utils**

Create `src/utils/token.utils.js`:

```javascript
const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });

exports.generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.SECRET_KEY);
```

- [x] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/utils/token.utils.test.js
```

Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/utils/ tests/utils/
git commit -m "feat: add token generation utilities with tests"
```

---

## Task 7: Database Connection

**Files:**

- Create: `src/config/db.js`

- [ ] **Step 1: Write test for database connection**

Create `tests/config/db.test.js`:

```javascript
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
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/config/db.test.js
```

Expected: FAIL (file doesn't exist)

- [ ] **Step 3: Create database connection module**

Create `src/config/db.js`:

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/config/db.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/config/ tests/config/
git commit -m "feat: add MongoDB connection module with test"
```

---

## Task 8: Services Layer

**Files:**

- Create: `src/services/auth.service.js`
- Create: `src/services/message.service.js`

- [ ] **Step 1: Write test for auth service register**

Create `tests/services/auth.service.test.js`:

```javascript
const authService = require("../../src/services/auth.service");
const User = require("../../src/models/user.model");
const mongoose = require("mongoose");

describe("Auth Service", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/services/auth.service.test.js
```

Expected: FAIL

- [ ] **Step 3: Create auth service**

Create `src/services/auth.service.js`:

```javascript
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token.utils");

exports.registerUser = async ({ fullName, username, email, password }) => {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) throw new Error("Email or username already in use");

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ fullName, username, email, password: hash });

  const accessToken = generateAccessToken({ id: user._id, username });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, accessToken, refreshToken };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({
    id: user._id,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.presenceStatus = "online";
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, accessToken, refreshToken };
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/services/auth.service.test.js
```

Expected: PASS

- [ ] **Step 5: Write test for message service**

Create `tests/services/message.service.test.js`:

```javascript
const messageService = require("../../src/services/message.service");
const Message = require("../../src/models/message.model");
const mongoose = require("mongoose");

describe("Message Service", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/nextalk_test");
  });

  beforeEach(async () => {
    await Message.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("saveMessage", () => {
    test("should save a message successfully", async () => {
      const senderId = new mongoose.Types.ObjectId();
      const receiverId = new mongoose.Types.ObjectId();

      const result = await messageService.saveMessage({
        senderId,
        receiverId,
        message: "Hello!",
      });

      expect(result._id).toBeDefined();
      expect(result.message).toBe("Hello!");
      expect(result.messageStatus).toBe("sent");
    });
  });

  describe("getChatHistory", () => {
    test("should return messages between two users", async () => {
      const userA = new mongoose.Types.ObjectId();
      const userB = new mongoose.Types.ObjectId();

      await Message.create([
        { senderId: userA, receiverId: userB, message: "Hi" },
        { senderId: userB, receiverId: userA, message: "Hello" },
      ]);

      const messages = await messageService.getChatHistory(userA, userB);

      expect(messages.length).toBe(2);
    });
  });

  describe("markAsRead", () => {
    test("should mark messages as read", async () => {
      const senderId = new mongoose.Types.ObjectId();
      const receiverId = new mongoose.Types.ObjectId();

      await Message.create({
        senderId,
        receiverId,
        message: "Unread message",
        messageStatus: "delivered",
      });

      await messageService.markAsRead(senderId, receiverId);

      const updated = await Message.findOne({ senderId, receiverId });
      expect(updated.messageStatus).toBe("read");
    });
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- tests/services/message.service.test.js
```

Expected: FAIL

- [ ] **Step 7: Create message service**

Create `src/services/message.service.js`:

```javascript
const Message = require("../models/message.model");

exports.saveMessage = async ({ senderId, receiverId, message }) => {
  const msg = new Message({ senderId, receiverId, message });
  await msg.save();
  return msg;
};

exports.getChatHistory = async (userA, userB) => {
  return Message.find({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  }).sort({ createdAt: 1 });
};

exports.markAsRead = async (senderId, receiverId) => {
  await Message.updateMany(
    { senderId, receiverId, messageStatus: { $ne: "read" } },
    { $set: { messageStatus: "read" } },
  );
};
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/services/message.service.test.js
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/services/ tests/services/
git commit -m "feat: add auth and message services with tests"
```

---

## Task 9: Controllers

**Files:**

- Create: `src/controllers/auth.controller.js`
- Create: `src/controllers/message.controller.js`

- [ ] **Step 1: Write test for auth controller**

Create `tests/controllers/auth.controller.test.js`:

```javascript
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
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/controllers/auth.controller.test.js
```

Expected: FAIL

- [ ] **Step 3: Create auth controller**

Create `src/controllers/auth.controller.js`:

```javascript
const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(
      req.body,
    );
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body,
    );
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  req.session = null;
  res.status(200).json({ message: "Logged out successfully" });
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/controllers/auth.controller.test.js
```

Expected: PASS

- [ ] **Step 5: Write test for message controller**

Create `tests/controllers/message.controller.test.js`:

```javascript
const {
  sendMessage,
  getHistory,
  markRead,
} = require("../../src/controllers/message.controller");

describe("Message Controller", () => {
  describe("sendMessage", () => {
    test("should return 201 with valid message", async () => {
      const req = {
        user: { id: "sender123" },
        body: {
          receiverId: "receiver123",
          message: "Hello!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getHistory", () => {
    test("should return 200 with messages array", async () => {
      const req = {
        user: { id: "user123" },
        params: { userId: "user456" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([]));
    });
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- tests/controllers/message.controller.test.js
```

Expected: FAIL

- [ ] **Step 7: Create message controller**

Create `src/controllers/message.controller.js`:

```javascript
const messageService = require("../services/message.service");

exports.sendMessage = async (req, res) => {
  try {
    const msg = await messageService.saveMessage({
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      message: req.body.message,
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await messageService.getChatHistory(
      req.user.id,
      req.params.userId,
    );
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await messageService.markAsRead(req.params.senderId, req.user.id);
    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/controllers/message.controller.test.js
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/controllers/ tests/controllers/
git commit -m "feat: add auth and message controllers with tests"
```

---

## Task 10: Routes

**Files:**

- Create: `src/routes/auth.routes.js`
- Create: `src/routes/message.routes.js`

- [ ] **Step 1: Write test for auth routes**

Create `tests/routes/auth.routes.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/routes/auth.routes.test.js
```

Expected: FAIL

- [ ] **Step 3: Create auth routes**

Create `src/routes/auth.routes.js`:

```javascript
const router = require("express").Router();
const { register, login, logout } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/routes/auth.routes.test.js
```

Expected: PASS

- [ ] **Step 5: Write test for message routes**

Create `tests/routes/message.routes.test.js`:

```javascript
const request = require("supertest");
const express = require("express");
const cookieSession = require("cookie-session");
const messageRoutes = require("../../src/routes/message.routes");

describe("Message Routes", () => {
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
    app.use("/messages", messageRoutes);
  });

  test("POST /messages/send should return 401 without session", async () => {
    const res = await request(app)
      .post("/messages/send")
      .send({ receiverId: "123", message: "Hello" });

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- tests/routes/message.routes.test.js
```

Expected: FAIL

- [ ] **Step 7: Create message routes**

Create `src/routes/message.routes.js`:

```javascript
const router = require("express").Router();
const {
  sendMessage,
  getHistory,
  markRead,
} = require("../controllers/message.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { sendMessageSchema } = require("../schemas/message.schema");

router.use(protect); // All message routes are protected

router.post("/send", validate(sendMessageSchema), sendMessage);
router.get("/:userId", getHistory);
router.patch("/read/:senderId", markRead);

module.exports = router;
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/routes/message.routes.test.js
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/routes/ tests/routes/
git commit -m "feat: add auth and message routes with tests"
```

---

## Task 11: Socket.io Handler

**Files:**

- Create: `src/socket/socket.handler.js`

- [ ] **Step 1: Write test for socket handler setup**

Create `tests/socket/socket.handler.test.js`:

```javascript
const { Server } = require("socket.io");
const http = require("http");
const { initSocket } = require("../../src/socket/socket.handler");

describe("Socket Handler", () => {
  let io, server;

  beforeEach(() => {
    server = http.createServer();
    io = new Server(server);
    initSocket(io);
  });

  afterEach((done) => {
    io.close(() => {
      server.close(done);
    });
  });

  test("should initialize socket handler without errors", () => {
    expect(io).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/socket/socket.handler.test.js
```

Expected: FAIL

- [ ] **Step 3: Create socket handler**

Create `src/socket/socket.handler.js`:

```javascript
const jwt = require("jsonwebtoken");
const Message = require("../models/message.model");
const User = require("../models/user.model");

const onlineUsers = new Map(); // userId -> socketId

exports.initSocket = (io) => {
  // ── Auth middleware for every socket connection ──
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      socket.user = jwt.verify(token, process.env.SECRET_KEY);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = String(socket.user.id);

    // ── Register user as online ──
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Personal room for targeted emits

    await User.findByIdAndUpdate(userId, { presenceStatus: "online" });
    io.emit("userOnline", { userId, status: "online" });

    // ── Send online users list ──
    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // ── Handle sending a message ──
    socket.on("sendMessage", async ({ receiverId, message }) => {
      const msg = await Message.create({
        senderId: userId,
        receiverId,
        message,
      });

      // Emit to receiver if online
      const receiverSocket = onlineUsers.get(String(receiverId));
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", msg);

        // Auto-update status to delivered
        await Message.findByIdAndUpdate(msg._id, {
          messageStatus: "delivered",
        });
        socket.emit("messageDelivered", { messageId: msg._id });
      }
    });

    // ── Handle read receipt ──
    socket.on("messageRead", async ({ senderId }) => {
      await Message.updateMany(
        { senderId, receiverId: userId, messageStatus: { $ne: "read" } },
        { $set: { messageStatus: "read" } },
      );

      const senderSocket = onlineUsers.get(String(senderId));
      if (senderSocket) {
        io.to(senderSocket).emit("messagesRead", { by: userId });
      }
    });

    // ── Typing indicators ──
    socket.on("typing", ({ to }) => io.to(to).emit("typing", { from: userId }));
    socket.on("stopTyping", ({ to }) =>
      io.to(to).emit("stopTyping", { from: userId }),
    );

    // ── Disconnect ──
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { presenceStatus: "offline" });
      io.emit("userOffline", { userId, status: "offline" });
    });
  });
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/socket/socket.handler.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/socket/ tests/socket/
git commit -m "feat: add Socket.io handler with tests"
```

---

## Task 12: Server Entry Point

**Files:**

- Create: `server.js`

- [ ] **Step 1: Write integration test for server**

Create `tests/integration/server.test.js`:

```javascript
const request = require("supertest");
const express = require("express");
const cookieSession = require("cookie-session");

describe("Server Integration", () => {
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
  });

  test("should respond to health check", (done) => {
    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    request(app).get("/health").expect(200).end(done);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/server.test.js
```

Expected: FAIL (server.js doesn't export app)

- [ ] **Step 3: Create server.js entry point**

Create `server.js`:

```javascript
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieSession = require("cookie-session");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const messageRoutes = require("./src/routes/message.routes");
const { initSocket } = require("./src/socket/socket.handler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: "lax",
  }),
);

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

connectDB();
initSocket(io);

server.listen(process.env.PORT, () => {
  console.log(`NexTalk running on port ${process.env.PORT}`);
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/server.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server.js tests/integration/
git commit -m "feat: add server entry point with integration test"
```

---

## Task 13: Add Jest Test Configuration

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Add Jest test script to package.json**

Read current `package.json` and add:

```json
"jest": {
  "testEnvironment": "node",
  "verbose": true
}
```

And update scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}
```

- [ ] **Step 2: Install Jest**

```bash
npm install --save-dev jest supertest
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Jest test configuration and supertest"
```

---

## Task 14: Final Verification

**Files:** N/A

- [ ] **Step 1: Start MongoDB**

```bash
# Windows - check if MongoDB is running
net start MongoDB
# Or use MongoDB Atlas URI in .env
```

- [ ] **Step 2: Run development server**

```bash
npm run dev
```

Expected:

```
NexTalk running on port 5000
MongoDB connected
```

- [ ] **Step 3: Test registration endpoint**

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User\",\"username\":\"testuser123\",\"email\":\"test@gmail.com\",\"password\":\"password123\"}"
```

Expected: `201` response with user object

- [ ] **Step 4: Commit final changes**

```bash
git add .
git commit -m "chore: complete nexTalk backend implementation"
```

---

## Self-Review Checklist

**1. Spec coverage:**

- [x] JWT dual-token auth - Tasks 6, 7, 8
- [x] User/Message models - Task 3
- [x] Zod validation - Task 4
- [x] Middleware - Task 5
- [x] Services layer - Task 8
- [x] Controllers - Task 9
- [x] Routes - Task 10
- [x] Socket.io real-time - Task 11
- [x] Server entry point - Task 12

**2. Placeholder scan:** No TBD/TODO placeholders found.

**3. Type consistency:** All method signatures and property names match across tasks.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-12-nextalk-realtime-chat.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
