// 📁 routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers,fetchUserById,fetchRoleName } = require('../controllers/user.Controller');

router.get('/', getAllUsers);
router.get('/:userId', fetchUserById);
router.get('/roles/:roleId', fetchRoleName);


module.exports = router;
