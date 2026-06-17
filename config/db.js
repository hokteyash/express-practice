const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.db_username,
  password: process.env.db_password,
  host: "localhost",
  port: 5432,
  database: "authdb",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
