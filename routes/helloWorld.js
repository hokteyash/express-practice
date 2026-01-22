const express = require('express')
const router = express.Router();
const print = require("../controllers/helloWorld");
const currentDB = require('../controllers/currentDB');

router.get("/",print)
router.get("/currentDB",currentDB)

module.exports = router