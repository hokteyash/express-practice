const express = require('express')
const router = express.Router();
const print = require("../controllers/helloWorld")

router.get("/",print)

module.exports = router