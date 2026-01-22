const express = require('express');
const { createUser, getAllUser, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const router = express.Router();

router.post("/",createUser);
router.get("/",getAllUser);
router.get("/:id",getUserById);
router.put("/:id",updateUser);
router.delete("/:id",deleteUser);

module.exports = router;
