const express = require('express');
const router = express.Router();
const { trackPaymentStatus } = require('../controllers/payments');

router.post('/track-status', trackPaymentStatus);

module.exports = router;
