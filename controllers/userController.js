const db = require("../config/db");

exports.createUser = async (req, res) => {
  const { name, email, age } = req.body;
  console.log(name);
  
  try {
    const result = await db.query(
      "INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name, email, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const result = await db.query("SELECT * from users");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  try {
    const result = await db.query(
      "UPDATE users SET name=$1, email=$2, age=$3 WHERE id=$4 RETURNING *",
      [name, email, age, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * from users where id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM users WHERE id=$1 RETURNING *", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
