const express = require('express');
const router = express.Router();

const locationController = require('../controllers/location.controller');

router.get('/getLocation', locationController.getLocation);

module.exports = router;
