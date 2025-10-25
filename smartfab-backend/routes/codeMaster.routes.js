// 📁 routes/codeMasterRoutes.js
const express = require('express');
const router = express.Router();
const codeMasterController = require('../controllers/codeMasterController');

router.get('/statuses', codeMasterController.getStatuses);

module.exports = router;