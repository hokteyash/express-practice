const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { createUsersTable, createMessagesTable } = require("./config/dbInit");
const initChatSocket = require("./sockets/chatSocket");

// initializes DB tables
const initDb = async () => {
  await createUsersTable();
  await createMessagesTable(); // depends on users table (FK), so must run after it
};
initDb();

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Socket.IO needs a raw http server to attach to, instead of app.listen directly
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initChatSocket(io);

server.listen(PORT, () =>
  console.log(`Server started listening on PORT ${PORT}`),
);
