const db = require('./db.js')

const createUsersTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
        `
    await db.query(query);
    console.log("Users table is ready");
    } catch (error) {
        console.error("Error creating users table", error);
    }
}

module.exports = createUsersTable;