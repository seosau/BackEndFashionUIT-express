const express = require('express');
const router = express.Router();

const adminController = require('../controllers/AdminController');

router.get('/stored-product', AdminController.store);
router.get('/login', AdminController.login);

module.exports = router;
