// Task 3: PostgreSQL Message APIs

const db = require("../config/db");

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const getRoomMessages = async (req, res) => {
  const { room } = req.params;
  let { limit, before } = req.query;

  if (!room) {
    return res.status(400).json({ status: "failed", message: "Room is required" });
  }

  limit = parseInt(limit, 10);
  if (!Number.isInteger(limit) || limit <= 0) limit = DEFAULT_PAGE_SIZE;
  limit = Math.min(limit, MAX_PAGE_SIZE);

  let beforeId = null;
  if (before !== undefined) {
    beforeId = parseInt(before, 10);
    if (!Number.isInteger(beforeId)) {
      return res.status(400).json({ status: "failed", message: "'before' must be a valid message id" });
    }
  }

  try {
    const params = [room, limit];
    let query = `
      SELECT
        m.id,
        m.room,
        m.message,
        m.created_at,
        u.id   AS sender_id,
        u.name AS sender_name,
        u.email AS sender_email
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.room = $1
    `;

    if (beforeId !== null) {
      query += ` AND m.id < $3`;
      params.push(beforeId);
    }

    query += ` ORDER BY m.id DESC LIMIT $2`;

    const result = await db.query(query, params);

    const messages = result.rows.map((row) => ({
      id: row.id,
      room: row.room,
      message: row.message,
      createdAt: row.created_at,
      sender: {
        id: row.sender_id,
        name: row.sender_name,
        email: row.sender_email,
      },
    }));

    messages.reverse();

    const nextCursor = result.rows.length === limit ? result.rows[result.rows.length - 1].id : null;

    return res.status(200).json({
      status: "success",
      data: {
        room,
        messages,
        pagination: {
          limit,
          nextCursor, // pass this back as `before` to fetch the next (older) page
          hasMore: nextCursor !== null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching room messages:", error);
    return res.status(500).json({ status: "failed", message: "Internal server error" });
  }
};

const saveMessage = async (req, res) => {
  const { room } = req.params;
  const { message } = req.body;
  const senderId = req.user?.id;

  if (!room) {
    return res.status(400).json({ status: "failed", message: "Room is required" });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ status: "failed", message: "'message' body parameter is mandatory" });
  }
  if (!senderId) {
    return res.status(401).json({ status: "failed", message: "You are not authorized" });
  }

  try {
    const result = await db.query(
      `INSERT INTO messages (room, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, room, message, created_at`,
      [room, senderId, message.trim()],
    );

    const saved = result.rows[0];

    return res.status(201).json({
      status: "success",
      data: {
        id: saved.id,
        room: saved.room,
        message: saved.message,
        createdAt: saved.created_at,
        sender: {
          id: senderId,
          name: req.user?.name,
          email: req.user?.email,
        },
      },
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ status: "failed", message: "Internal server error" });
  }
};

module.exports = {
  getRoomMessages,
  saveMessage,
};
