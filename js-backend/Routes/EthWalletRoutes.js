const express = require('express');
const { ethers } = require('ethers');
const bip39 = require('bip39');
const axios = require('axios');

const router = express.Router();

// Generate Wallet
router.get('/wallet/create', async (req, res) => {
  const mnemonic = bip39.generateMnemonic();
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  res.json({
    address: wallet.address,
    mnemonic,
  });
});

// Get Token Price (e.g., ETH)
router.get('/price/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`;
  try {
    const { data } = await axios.get(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get token price' });
  }
});

// Send ETH (can be adapted for ERC20 tokens)
router.post('/wallet/send', async (req, res) => {
  const { privateKey, to, amount } = req.body;
  try {
    const provider = new ethers.providers.InfuraProvider('mainnet', 'INFURA_API_KEY');
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
    });
    res.json({ txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
