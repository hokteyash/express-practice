
const socketAuth = require("../middlewares/socketAuth");
const db = require("../config/db");
const {
  addMessage,
  getMessages,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUserCount,
} = require("../utils/roomManager");

const socketRoomMap = new Map(); // socketId -> roomName

const initChatSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.user?.email})`);

    // ---- JOIN ROOM ----
    socket.on("join_room", (data) => {
      const roomName = typeof data === "string" ? data : data?.room;

      if (!roomName) {
        return socket.emit("error_message", { message: "Room name is required" });
      }

      const previousRoom = socketRoomMap.get(socket.id);
      if (previousRoom && previousRoom !== roomName) {
        socket.leave(previousRoom);
        removeUserFromRoom(previousRoom, socket.id);
        socket.to(previousRoom).emit("user_left", {
          message: `${socket.user?.name || "A user"} has left the room`,
          userId: socket.user?.id,
          name: socket.user?.name,
          room: previousRoom,
          timestamp: new Date().toISOString(),
        });
      }

      socket.join(roomName);
      socketRoomMap.set(socket.id, roomName);
      addUserToRoom(roomName, socket.id, {
        id: socket.user?.id,
        name: socket.user?.name,
        email: socket.user?.email,
      });

      socket.emit("room_history", {
        room: roomName,
        messages: getMessages(roomName),
      });

      socket.to(roomName).emit("user_joined", {
        message: `${socket.user?.name || "A user"} has joined the room`,
        userId: socket.user?.id,
        name: socket.user?.name,
        room: roomName,
        timestamp: new Date().toISOString(),
      });

      console.log(`${socket.user?.email} joined room: ${roomName}`);
    });

    // ---- SEND MESSAGE ----
    socket.on("send_message", async (data) => {
      const roomName = socketRoomMap.get(socket.id);

      if (!roomName) {
        return socket.emit("error_message", {
          message: "You must join a room before sending messages",
        });
      }

      const text = data?.message ?? data?.text;
      if (!text || typeof text !== "string" || !text.trim()) {
        return socket.emit("error_message", { message: "Message text is required" });
      }

      const trimmedText = text.trim();
      const message = {
        room: roomName,
        userId: socket.user?.id,
        name: socket.user?.name,
        message: trimmedText,
        timestamp: new Date().toISOString(),
      };

      addMessage(roomName, message);

      // broadcast immediately so the DB write doesn't add latency to delivery
      io.to(roomName).emit("receive_message", message);

      try {
        await db.query(
          `INSERT INTO messages (room, sender_id, message) VALUES ($1, $2, $3)`,
          [roomName, socket.user?.id, trimmedText],
        );
      } catch (error) {
        console.error("Failed to persist message to DB:", error);
      }
    });

    // ---- LEAVE ROOM EXPLICITLY (optional, in addition to disconnect) ----
    socket.on("leave_room", () => {
      const roomName = socketRoomMap.get(socket.id);
      if (!roomName) return;

      socket.leave(roomName);
      removeUserFromRoom(roomName, socket.id);
      socketRoomMap.delete(socket.id);

      socket.to(roomName).emit("user_left", {
        message: `${socket.user?.name || "A user"} has left the room`,
        userId: socket.user?.id,
        name: socket.user?.name,
        room: roomName,
        timestamp: new Date().toISOString(),
      });
    });

    // ---- DISCONNECT ----
    socket.on("disconnect", () => {
      const roomName = socketRoomMap.get(socket.id);

      if (roomName) {
        removeUserFromRoom(roomName, socket.id);
        socketRoomMap.delete(socket.id);

        socket.to(roomName).emit("user_left", {
          message: `${socket.user?.name || "A user"} has disconnected`,
          userId: socket.user?.id,
          name: socket.user?.name,
          room: roomName,
          timestamp: new Date().toISOString(),
        });

        console.log(
          `${socket.user?.email} disconnected from room: ${roomName} (remaining: ${getRoomUserCount(roomName)})`,
        );
      } else {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });
};

module.exports = initChatSocket;
