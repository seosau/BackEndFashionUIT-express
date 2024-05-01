const express = require('express');
const router = express.Router();

const hourlySaleController = require('../controllers/hourlySale.controller')

router.get('/get', hourlySaleController.index)
router.post('/add', hourlySaleController.store)

module.exports = router;