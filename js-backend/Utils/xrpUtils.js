const xrpl = require("xrpl");
const RIPPLE_EPOCH = 946684800;

const prepareAccountData = (rawAccountData) => {
  return {
    classicAddress: rawAccountData.Account,
    xAddress: xrpl.classicAddressToXAddress(rawAccountData.Account, false, true),
    xrpBalance: xrpl.dropsToXrp(rawAccountData.Balance)
  };
};

const prepareLedgerData = (rawLedgerData) => {
  const timestamp = RIPPLE_EPOCH + (rawLedgerData.ledger_time ?? rawLedgerData.close_time);
  const dateTime = new Date(timestamp * 1000);
  const dateTimeString = dateTime.toLocaleDateString() + ' ' + dateTime.toLocaleTimeString();

  return {
    ledgerIndex: rawLedgerData.ledger_index,
    ledgerHash: rawLedgerData.ledger_hash,
    ledgerCloseTime: dateTimeString
  };
};

module.exports = {
  prepareAccountData,
  prepareLedgerData
};
