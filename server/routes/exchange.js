const express = require('express');
const router = express.Router();
const { createExchange, getMyExchanges, getExchange, updateExchangeStatus, cancelExchange } = require('../controllers/exchangeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createExchange);
router.get('/', protect, getMyExchanges);
router.get('/:id', protect, getExchange);
router.put('/:id/status', protect, updateExchangeStatus);
router.put('/:id/cancel', protect, cancelExchange);

module.exports = router;
