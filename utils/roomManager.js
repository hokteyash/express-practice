
const MAX_MESSAGES_PER_ROOM = 20;

const rooms = new Map();

const getOrCreateRoom = (roomName) => {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, {
      messages: [],
      users: new Map()
    });
  }
  return rooms.get(roomName);
};

const addMessage = (roomName, message) => {
  const room = getOrCreateRoom(roomName);
  room.messages.push(message);

  if (room.messages.length > MAX_MESSAGES_PER_ROOM) {
    room.messages.shift();
  }

  return room.messages;
};

const getMessages = (roomName) => {
  if (!rooms.has(roomName)) return [];
  return rooms.get(roomName).messages;
};

const addUserToRoom = (roomName, socketId, user) => {
  const room = getOrCreateRoom(roomName);
  room.users.set(socketId, user);
};

const removeUserFromRoom = (roomName, socketId) => {
  if (!rooms.has(roomName)) return;
  rooms.get(roomName).users.delete(socketId);

  if (rooms.get(roomName).users.size === 0) {
    rooms.delete(roomName);
  }
};

const getRoomUserCount = (roomName) => {
  if (!rooms.has(roomName)) return 0;
  return rooms.get(roomName).users.size;
};

module.exports = {
  MAX_MESSAGES_PER_ROOM,
  addMessage,
  getMessages,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUserCount,
};
