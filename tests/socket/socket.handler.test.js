const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("../../src/socket/socket.handler");

describe("Socket Handler", () => {
  let io;
  let server;

  beforeEach((done) => {
    server = http.createServer();
    io = new Server(server);
    initSocket(io);
    server.listen(0, done);
  });

  afterEach((done) => {
    io.close(() => {
      if (server.listening) {
        server.close(done);
        return;
      }

      done();
    });
  });

  test("should initialize socket handler without errors", () => {
    expect(io).toBeDefined();
  });
});
