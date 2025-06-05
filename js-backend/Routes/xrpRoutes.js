const express = require('express');
const router = express.Router();
const xrpController = require('../Controllers/xrpController');

router.post('/create', xrpController.createWallet);
router.post('/balance', xrpController.getBalance);
router.post('/transfer', xrpController.transferXRP);
router.get('/wallets', xrpController.fetchWallets);
module.exports = router;
