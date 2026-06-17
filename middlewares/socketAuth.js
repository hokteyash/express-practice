
const jwt = require("jsonwebtoken");
const socketAuth = (socket, next) => {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.headers?.Authorization;

    if (!rawToken) {
      return next(new Error("Authentication error: token not provided"));
    }

    const token = rawToken.startsWith("Bearer ")
      ? rawToken.split(" ")[1]
      : rawToken;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Authentication error: invalid or expired token"));
  }
};

module.exports = socketAuth;
