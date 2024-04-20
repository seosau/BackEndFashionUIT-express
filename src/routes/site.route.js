const express = require('express');
const router = express.Router();

const locationRouter = require('./location.route')

router.use('/location', locationRouter);

module.exports = router;