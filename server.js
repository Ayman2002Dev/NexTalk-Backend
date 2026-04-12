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

const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(
    cookieSession({
      name: "session",
      secret: process.env.SESSION_SECRET,
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
    }),
  );

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/auth", authRoutes);
  app.use("/messages", messageRoutes);

  return app;
};

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

initSocket(io);

const startServer = async () => {
  await connectDB();

  const port = process.env.PORT || 5000;
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`NexTalk running on port ${port}`);
      resolve(server);
    });
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.createApp = createApp;
module.exports.server = server;
module.exports.io = io;
module.exports.startServer = startServer;
