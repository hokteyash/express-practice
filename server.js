const express = require('express')

require('dotenv').config()

const app = express()

const helloWorldRoute = require("./routes/helloWorld")

const PORT = process.env.PORT;

app.use("/api/helloWorld",helloWorldRoute)

app.listen(PORT, () => console.log(`Server started listening on PORT ${PORT}`));