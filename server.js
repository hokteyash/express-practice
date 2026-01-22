const express = require('express')

require('dotenv').config()

const app = express()

app.use(express.json());

const helloWorldRoute = require("./routes/helloWorld")
const userRoutes = require("./routes/usersRoute");
const createUsersTable = require('./config/dbInit')

// initializes DB tables
createUsersTable();

const PORT = process.env.PORT;

app.use("/api/helloWorld",helloWorldRoute)
app.use("/api/users",userRoutes)

app.listen(PORT, () => console.log(`Server started listening on PORT ${PORT}`));