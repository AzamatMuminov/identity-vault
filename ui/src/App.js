import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import RecoveryABI from "./Recovery.json";
import { ipfs } from "./ipfs";

function App() {
  // Ethereum / Contract state
  const [provider, setProvider] = useState(null);
  const [signer, setSigner]     = useState(null);
  const [account, setAccount]   = useState("");
  const [recovery, setRecovery] = useState(null);
  const [contractOwner, setContractOwner] = useState("");

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // Toast notification
  const [toast, setToast] = useState("");

  // Busy flags
  const [busyUpload, setBusyUpload] = useState(false);
  const [busyVerify, setBusyVerify] = useState(false);
  const [busyRecovery, setBusyRecovery] = useState(false);

  // Inline form state for VC issuance
  const [vcInput, setVcInput] = useState("");
  const [vcError, setVcError] = useState("");
  const [vcCid, setVcCid] = useState("");

  // Inline form state for VC verification
  const [verifyCidInput, setVerifyCidInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifiedJwt, setVerifiedJwt] = useState("");

  // History of uploaded CIDs
  const [uploadedCids, setUploadedCids] = useState([]);

  // Utility to show toast messages
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // Initialize MetaMask / ethers provider
  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(p);
      p.send("eth_requestAccounts", []).then((accounts) => {
        setAccount(accounts[0]);
        setSigner(p.getSigner());
      });
    }
  }, []);

  // Once signer exists, instantiate the Recovery contract and fetch owner
  useEffect(() => {
    if (signer) {
      const deployedAddress = "YOUR_RECOVERY_ADDRESS_HERE"; // ← Replace with your deployed address
      const contract = new ethers.Contract(deployedAddress, RecoveryABI.abi, signer);
      setRecovery(contract);
    }
  }, [signer]);

  // Fetch current contract owner whenever contract is set or after recovery
  useEffect(() => {
    if (recovery) {
      recovery.owner()
        .then((ownerAddr) => {
          setContractOwner(ownerAddr);
        })
        .catch((e) => {
          console.error("Failed to fetch owner:", e);
        });
    }
  }, [recovery]);

  // Upload VC to IPFS
  async function uploadVC() {
    setVcError("");
    setVcCid("");
    if (!vcInput.trim()) {
      setVcError("Please paste a valid VC JWT.");
      return;
    }
    if (!account) {
      setVcError("Wallet not connected.");
      return;
    }
    setBusyUpload(true);
    try {
      const { cid } = await ipfs.add(vcInput.trim());
      const cidStr = cid.toString();
      setVcCid(cidStr);
      setUploadedCids((prev) => [cidStr, ...prev]);
      showToast(`Stored VC at ${cidStr}`);
    } catch (error) {
      console.error(error);
      setVcError("Failed to upload to IPFS.");
    } finally {
      setBusyUpload(false);
    }
  }

  // Verify VC by fetching JWT from IPFS
  async function verifyVC() {
    setVerifyError("");
    setVerifiedJwt("");
    if (!verifyCidInput.trim()) {
      setVerifyError("Please enter a CID.");
      return;
    }
    setBusyVerify(true);
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${verifyCidInput.trim()}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const vcJwt = await response.text();
      setVerifiedJwt(vcJwt);
      showToast("Fetched VC JWT");
    } catch (error) {
      console.error(error);
      setVerifyError("Failed to fetch VC from IPFS.");
    } finally {
      setBusyVerify(false);
    }
  }

  // Confirm recovery via contract call
  async function confirmRecovery() {
    if (!recovery) return;
    const newOwner = prompt("Enter new owner address:");
    if (!newOwner || !ethers.utils.isAddress(newOwner)) {
      showToast("Invalid address.");
      return;
    }
    setBusyRecovery(true);
    try {
      const tx = await recovery.confirmRecovery(newOwner);
      showToast("Recovery transaction sent. Waiting for confirmation...");
      await tx.wait();
      // After transaction, fetch updated owner
      const updatedOwner = await recovery.owner();
      setContractOwner(updatedOwner);
      showToast("Recovery successful!");
    } catch (error) {
      console.error(error);
      showToast("Recovery transaction failed.");
    } finally {
      setBusyRecovery(false);
    }
  }

  // Button base styles
  const buttonBase = {
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    width: "100%",
    transition: "background-color 0.2s ease",
    marginBottom: "12px"
  };

  // Color schemes
  const colors = {
    background: darkMode ? "#1e1e1e" : "#e9ecef",
    cardBackground: darkMode ? "#2e2e2e" : "#ffffff",
    textPrimary: darkMode ? "#eeeeee" : "#333333",
    textSecondary: darkMode ? "#cccccc" : "#555555",
    btnUpload: darkMode ? "#34495e" : "#2c3e50",
    btnVerify: darkMode ? "#3c7fae" : "#2980b9",
    btnRecovery: darkMode ? "#a94a46" : "#c0392b",
    btnDisabled: "#777777"
  };

  return (
    <div
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`,
        color: colors.textPrimary,
        position: "relative"
      }}
    >
      {/* Header */}
      <header style={{ position: "absolute", top: 20, left: 20 }}>
        <h2 style={{ margin: 0, fontSize: "1rem", color: colors.textSecondary }}>
          {/* Placeholder for logo; remove src attribute if you don’t have a logo file */}
          <img
            src="logo.png"
            alt="DigiVault Logo"
            style={{ height: "24px", verticalAlign: "middle", marginRight: "8px" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <span>DigiVault</span>
        </h2>
      </header>

      {/* Dark/Light Mode Toggle */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <label style={{ cursor: "pointer", color: colors.textSecondary }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            style={{ marginRight: "8px" }}
          />
          {darkMode ? "Light Mode" : "Dark Mode"}
        </label>
      </div>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: "8px",
          boxShadow: darkMode
            ? "0 4px 8px rgba(0,0,0,0.5)"
            : "0 4px 8px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
          margin: "0 16px",
          padding: "24px",
          textAlign: "center",
          position: "relative"
        }}
      >
        {/* Title & Subtitle */}
        <h1 style={{ marginBottom: "8px", fontSize: "1.75rem" }}>
          DigiVault
        </h1>
        <p style={{ marginBottom: "24px", color: colors.textSecondary, fontSize: "1rem" }}>
          Decentralized Identity Vault
        </p>

        {/* Wallet & Contract Info */}
        <p style={{ marginBottom: "8px", color: colors.textSecondary }}>
          Connected as:{" "}
          <span style={{ color: account ? colors.textPrimary : "#999999" }}>
            {account || "(not connected)"}
          </span>
        </p>
        {recovery && (
          <p style={{ marginBottom: "16px", color: colors.textSecondary }}>
            Contract Owner:{" "}
            <span style={{ color: colors.textPrimary }}>
              {contractOwner || "(loading...)"}
            </span>
          </p>
        )}

        {/* Issue & Store VC Section */}
        <div style={{ marginBottom: "24px" }}>
          <textarea
            rows={4}
            placeholder="Paste VC JWT here..."
            value={vcInput}
            onChange={(e) => setVcInput(e.target.value)}
            disabled={!account || busyUpload}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${darkMode ? "#555555" : "#cccccc"}`,
              backgroundColor: darkMode ? "#3a3a3a" : "#ffffff",
              color: colors.textPrimary,
              marginBottom: "8px"
            }}
          />
          <button
            onClick={uploadVC}
            disabled={!account || busyUpload}
            style={{
              ...buttonBase,
              backgroundColor: (!account || busyUpload)
                ? colors.btnDisabled
                : colors.btnUpload,
              color: "#ffffff",
              cursor: (!account || busyUpload) ? "not-allowed" : "pointer"
            }}
          >
            {busyUpload ? "Uploading…" : "Upload VC to IPFS"}
          </button>
          {vcError && (
            <p style={{ color: "#e74c3c", marginTop: "8px" }}>{vcError}</p>
          )}
          {vcCid && (
            <p style={{ color: colors.textSecondary, marginTop: "8px" }}>
              Stored at CID: <code>{vcCid}</code>
            </p>
          )}
        </div>

        {/* Verify VC Section */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Enter CID to verify..."
            value={verifyCidInput}
            onChange={(e) => setVerifyCidInput(e.target.value)}
            disabled={!account || busyVerify}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${darkMode ? "#555555" : "#cccccc"}`,
              backgroundColor: darkMode ? "#3a3a3a" : "#ffffff",
              color: colors.textPrimary,
              marginBottom: "8px"
            }}
          />
          <button
            onClick={verifyVC}
            disabled={!account || busyVerify}
            style={{
              ...buttonBase,
              backgroundColor: (!account || busyVerify)
                ? colors.btnDisabled
                : colors.btnVerify,
              color: "#ffffff",
              cursor: (!account || busyVerify) ? "not-allowed" : "pointer"
            }}
          >
            {busyVerify ? "Fetching…" : "Fetch VC from IPFS"}
          </button>
          {verifyError && (
            <p style={{ color: "#e74c3c", marginTop: "8px" }}>{verifyError}</p>
          )}
          {verifiedJwt && (
            <div
              style={{
                marginTop: "8px",
                textAlign: "left",
                maxHeight: "100px",
                overflowY: "auto",
                backgroundColor: darkMode ? "#3a3a3a" : "#f9f9f9",
                padding: "8px",
                borderRadius: "4px",
                border: `1px solid ${darkMode ? "#555555" : "#cccccc"}`,
                color: colors.textPrimary,
                fontSize: "0.85rem"
              }}
            >
              <code>{verifiedJwt}</code>
            </div>
          )}
        </div>

        {/* Uploaded CIDs History */}
        {uploadedCids.length > 0 && (
          <div style={{ marginBottom: "24px", textAlign: "left" }}>
            <h3 style={{ color: colors.textPrimary, marginBottom: "8px" }}>
              Uploaded CIDs:
            </h3>
            <ul style={{ paddingLeft: "20px", color: colors.textSecondary }}>
              {uploadedCids.map((c, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm Recovery Button */}
        {recovery && (
          <button
            onClick={confirmRecovery}
            disabled={!account || busyRecovery}
            style={{
              ...buttonBase,
              backgroundColor: (!account || busyRecovery)
                ? colors.btnDisabled
                : colors.btnRecovery,
              color: "#ffffff",
              cursor: (!account || busyRecovery) ? "not-allowed" : "pointer"
            }}
          >
            {busyRecovery ? "Processing…" : "Confirm Recovery"}
          </button>
        )}
      </div>

      {/* Footer */}
      <footer style={{ position: "absolute", bottom: 20, fontSize: "0.85rem", color: colors.textSecondary }}>
        <a
          href="https://github.com/your-repo"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.textSecondary, textDecoration: "none" }}
        >
          View on GitHub
        </a>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "rgba(0,0,0,0.8)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "4px",
            opacity: 1,
            transition: "opacity 0.3s ease"
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
