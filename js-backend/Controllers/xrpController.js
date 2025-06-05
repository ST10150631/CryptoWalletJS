const xrpl = require("xrpl");
const { prepareAccountData, prepareLedgerData } = require('../Utils/xrpUtils');
const fs = require("fs");
const { response } = require("express");

require("dotenv").config();

const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";


exports.createWallet = async (req, res) => {
  const client = new xrpl.Client(TESTNET_URL);
  await client.connect();

  try {
    // Automatically fund wallet on testnet
    const funded = await client.fundWallet(); 
    const wallet = funded.wallet;

    console.log("Funded wallet:", wallet);

    const walletData = {
      address: wallet.classicAddress,
      secret: wallet.seed
    };

    res.json(walletData);

    // Save wallet to file
    let wallets = [];
    if (fs.existsSync('wallets.json')) {
      wallets = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
    }

    wallets.push(walletData);
    fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));
  } catch (err) {
    console.error("Wallet creation error:", err);
    res.status(500).json({ error: "Failed to create wallet" });
  } finally {
    await client.disconnect();
  }
};


exports.fetchWallets = async (req, res) => {
  try {
    const wallets = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
    res.json(wallets);
    console.log("Fetched wallets:", wallets);
  } catch (err) {
    console.error("Error fetching wallets:", err);
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
};


exports.getBalance = async (req, res) => {
  const { address } = req.body;
  const client = new xrpl.Client(TESTNET_URL);
  await client.connect();

  try {
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated"
    });

    res.json({
      balance: xrpl.dropsToXrp(response.result.account_data.Balance)
    });
    console.log("Balance fetched:",balance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    console.log(response.body);
    await client.disconnect();
  }
};

exports.transferXRP = async (req, res) => {
  const { fromSecret, toAddress, amount } = req.body;

  const client = new xrpl.Client(TESTNET_URL);
  await client.connect();

  try {
    const wallet = xrpl.Wallet.fromSeed(fromSecret);

    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Amount: xrpl.xrpToDrops(amount),
      Destination: toAddress
    });

    const signed = wallet.sign(prepared);
    const tx = await client.submitAndWait(signed.tx_blob);

    res.json({
      result: tx.result,
      hash: signed.hash,
      explorer: `https://testnet.xrpl.org/transactions/${signed.hash}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    await client.disconnect();
  }
};
