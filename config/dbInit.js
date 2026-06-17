const db = require('./db.js')

const createUsersTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
        `
    await db.query(query);
    console.log("Users table is ready");
    } catch (error) {
        console.error("Error creating users table", error);
    }
}

const createMessagesTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room VARCHAR(150) NOT NULL,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
        `
    await db.query(query);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_room_id
      ON messages (room, id DESC);
    `);

    console.log("Messages table is ready");
    } catch (error) {
        console.error("Error creating messages table", error);
    }
}

module.exports = { createUsersTable, createMessagesTable };