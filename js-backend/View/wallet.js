const API_BASE = "http://localhost:3000/xrp";

const btnGenerate = document.getElementById("btn-generate");
const btnSend     = document.getElementById("btn-send");
const walletInfo  = document.getElementById("wallet-info");

const elAddress   = document.getElementById("wallet-address");
const elSecret    = document.getElementById("private-key");
const elBalance   = document.getElementById("balance");
const elRecipient = document.getElementById("recipient");
const elAmount    = document.getElementById("amount");
const elStatus    = document.getElementById("send-status");

let currentSecret = null;
let currentAddress = null;
const walletListEl = document.getElementById("wallet-list");

let walletType = "xrp"; // Default type

const API_MAP = {
  xrp: "http://localhost:3000/xrp",
  eth: "http://localhost:3000/eth",
  btc: "http://localhost:3000/btc",
  usdt: "http://localhost:3000/usdt"
};

function updateApiBase() {
  API_BASE = API_MAP[walletType];
}
document.querySelectorAll('input[name="wallet-type"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    walletType = e.target.value;
    updateApiBase();
    fetchWallets();
  });
});


// Auto-refresh balance every 10 seconds
setInterval(() => {
  if (currentAddress) fetchBalance();
}, 10000);

async function fetchWallets() {
  try {
    const resp = await fetch(`${API_BASE}/wallets`);
    const wallets = await resp.json();

    if (resp.ok && Array.isArray(wallets)) {
      walletListEl.innerHTML = "";

      wallets.forEach(wallet => {
        const btn = document.createElement("button");
        btn.textContent = wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4);
        btn.onclick = async () => {
          currentAddress = wallet.address;
          currentSecret = wallet.secret;
          elAddress.textContent = currentAddress;
          elSecret.textContent = currentSecret;
          walletInfo.classList.remove("hidden");
          await fetchBalance();
        };
        walletListEl.appendChild(btn);
      });

      // Load latest wallet
      if (wallets.length > 0) {
        const latest = wallets[wallets.length - 1];
        currentAddress = latest.address;
        currentSecret = latest.secret;
        elAddress.textContent = currentAddress;
        elSecret.textContent = currentSecret;
        walletInfo.classList.remove("hidden");
        await fetchBalance();
      }
    }
  } catch (err) {
    console.error("Failed to load wallets:", err);
  }
}
fetchWallets();

btnGenerate.addEventListener("click", async () => {
  try {
    const resp = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await resp.json();

    if (resp.ok) {
      currentAddress = data.address;
      currentSecret  = data.secret;

      elAddress.textContent = currentAddress;
      elSecret.textContent  = currentSecret;
      walletInfo.classList.remove("hidden");

      await fetchBalance();
    } else {
      alert(`Error generating wallet: ${data.error || resp.statusText}`);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to create wallet. Check console for details.");
  }
});

btnSend.addEventListener("click", async () => {
  const toAddress = elRecipient.value.trim();
  const amount    = elAmount.value.trim();

  if (!currentSecret) return alert("Generate a wallet first.");
  if (!toAddress || !amount) return alert("Please enter both recipient and amount.");

  elStatus.textContent = "Sending...";
  try {
    const resp = await fetch(`${API_BASE}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromSecret: currentSecret, toAddress, amount })
    });

    const result = await resp.json();

    if (resp.ok) {
      elStatus.innerHTML = `✅ Sent ${amount} XRP<br/>
        Tx Hash: ${result.hash}<br/>
        <a href="${result.explorer}" target="_blank">View on XRPL Explorer</a>`;
      elRecipient.value = "";
      elAmount.value = "";
      await fetchBalance(); // Refresh after sending
    } else {
      elStatus.textContent = `❌ Error: ${result.error || resp.statusText}`;
    }
  } catch (err) {
    console.error(err);
    elStatus.textContent = "Failed to send. See console.";
  }
});

async function fetchBalance() {
  if (!currentAddress) return;

  try {
    const resp = await fetch(`${API_BASE}/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: currentAddress })
    });
    const data = await resp.json();
    console.log("Balance response:", data);
    if (resp.ok) {
      elBalance.textContent = `${data.balance} XRP`;
    } else {
      elBalance.textContent = `Error`;
      console.error(data);
    }
  } catch (err) {
    console.error(err);
    elBalance.textContent = `Error`;
  }
}
