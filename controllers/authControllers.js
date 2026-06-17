// Task 1: User Registeration and Login API

const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({
      status: "failed",
      message: "'email' or 'password' body parameter is mandatory",
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email);

  if (!isValid) {
    return res.status(400).send({
      status: "failed",
      message: "Email format is invalid",
    });
  }
  try {
    const user = await db.query("SELECT * from users where email = $1", [
      email,
    ]);
    if (user?.rowCount < 1) {
      return res
        .status(409)
        .json({
          status: "failed",
          message:
            "You don't have an account, please create your account first",
        });
    }
    const isMatch = await bcrypt.compare(password, user?.rows[0]?.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      id:user?.rows[0]?.id,
      name: user?.rows[0]?.name,
      email
    };
    
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({status:'success', token: accessToken, data:payload });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({
      status: "failed",
      message: "'name', 'email' or 'password' body parameter is mandatory",
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email);

  if (!isValid) {
    return res.status(400).send({
      status: "failed",
      message: "Email format is invalid",
    });
  }

  try {
    const user = await db.query("SELECT * from users where email = $1", [
      email,
    ]);
    if (user?.rowCount > 0) {
      return res
        .status(409)
        .json({ status: "failed", message: "Email already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashPassword],
    );

    const payload = {
      id: result?.rows[0]?.id,
      name,
      email,
    };

    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({ status: "success", token: accessToken, data: payload });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
  register,
};
