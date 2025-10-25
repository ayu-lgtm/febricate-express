// 📁 routes/menuRoutes.js
const express = require('express');
const { getUserMenus } = require('../controllers/menuController');
const router = express.Router();

router.get('/menus', getUserMenus);

module.exports = router;