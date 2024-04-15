const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');

router.get('/stored-product', adminController.store);
router.get('/login', adminController.login);

module.exports = router;
