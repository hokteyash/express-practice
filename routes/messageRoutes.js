const express = require("express");
const { getRoomMessages, saveMessage } = require("../controllers/messageControllers");
const validateToken = require("../middlewares/validateToken");

const router = express.Router();

router.get("/:room", validateToken, getRoomMessages);
router.post("/:room", validateToken, saveMessage);

module.exports = router;
