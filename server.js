const express = require("express");

require("dotenv").config();

const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const createUsersTable = require("./config/dbInit");

// initializes DB tables
createUsersTable();

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server started listening on PORT ${PORT}`));
