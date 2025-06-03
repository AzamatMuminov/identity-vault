# DigiVault

**Decentralized Identity Vault**

DigiVault is an **all-OSS, no-cloud** dApp for decentralized identity management. It provides:

- A smart contract for social-guardian recovery
- Hardhat setup for a local Ethereum network
- IPFS integration for Verifiable Credential (VC) storage
- A React front-end with MetaMask integration
- Inline forms and toasts (no browser `prompt`/`alert`)
- Dark/Light mode toggle
- Uploaded CID history (persisted in `localStorage`)
- Loading indicators & disabled buttons during operations
- Contract owner display and “Confirm Recovery” flow
- Custom favicon and branding
- Mobile-friendly, responsive layout
- Cryptographic VC verification using `did-jwt-vc`

---

## Table of Contents

1. [Project Structure](#project-structure)  
2. [Prerequisites](#prerequisites)  
3. [Getting Started](#getting-started)  
   - [1. Clone & Install](#1-clone--install)  
   - [2. Start Local Hardhat Node](#2-start-local-hardhat-node)  
   - [3. Deploy the Recovery Contract](#3-deploy-the-recovery-contract)  
   - [4. Configure MetaMask](#4-configure-metamask)  
   - [5. Install & Run IPFS](#5-install--run-ipfs)  
   - [6. Configure IPFS CORS](#6-configure-ipfs-cors)  
   - [7. Generate a Sample VC JWT](#7-generate-a-sample-vc-jwt)  
   - [8. Launch the React UI](#8-launch-the-react-ui)  
4. [How To Use DigiVault](#how-to-use-digivault)  
   - [Issue & Store VC](#issue--store-vc)  
   - [Verify VC](#verify-vc)  
   - [Confirm Recovery](#confirm-recovery)  
5. [Automated Tests](#automated-tests)  
   - [Smart-Contract Tests](#smart-contract-tests)  
   - [React Component Tests](#react-component-tests)  
6. [Persisting CID History](#persisting-cid-history)  
7. [Cryptographic VC Verification](#cryptographic-vc-verification)  
8. [Deploying to a Public Testnet](#deploying-to-a-public-testnet)  
9. [Further Enhancements](#further-enhancements)  
10. [License](#license)

---

## Project Structure

```
identity-vault/
├─ contracts/
│  └─ Recovery.sol
├─ scripts/
│  ├─ deploy.js
│  └─ generateVC.js
├─ ui/
│  ├─ public/
│  │  ├─ index.html
│  │  ├─ favicon.png
│  │  ├─ manifest.json
│  │  └─ logo.png         ← optional branding image
│  ├─ src/
│  │  ├─ App.js
│  │  ├─ ipfs.js
│  │  ├─ Recovery.json    ← ABI wrapper `{ "abi": [ … ] }`
│  │  ├─ App.test.js      ← Jest + React Testing Library
│  │  └─ index.js
│  ├─ package.json
│  └─ …
├─ hardhat.config.js
├─ package.json
├─ README.md
└─ …
```

---

## Prerequisites

1. **Git**  
2. **Node.js (LTS)**  
3. **Yarn** _(optional)_  
4. **Hardhat** (for local Ethereum)  
5. **IPFS CLI** (go-ipfs)  
6. **MetaMask** (browser extension)  

---

## Getting Started

Follow these steps to run DigiVault locally:

### 1. Clone & Install

```bash
git clone https://github.com/AzamatMuminov/identity-vault.git
cd identity-vault

# Install root dependencies (Hardhat, ethers, etc.)
npm install
```

---

### 2. Start Local Hardhat Node

In a new terminal:

```bash
cd identity-vault
npx hardhat node
```

- Spins up a local Ethereum JSON-RPC at `http://127.0.0.1:8545`.
- Prints out ten accounts (with 10 000 ETH each) and their private keys.

---

### 3. Deploy the Recovery Contract

In another terminal:

```bash
cd identity-vault
npx hardhat run scripts/deploy.js --network localhost
```

- Copy the printed **“Recovery deployed to: 0x…”** address.
- Open `ui/src/App.js` and replace `"YOUR_RECOVERY_ADDRESS_HERE"` with that address.

---

### 4. Configure MetaMask

1. **Install MetaMask** if you haven’t already.  
2. **Add a custom network**:
   - **Network Name:** Hardhat Localhost  
   - **RPC URL:** `http://127.0.0.1:8545`  
   - **Chain ID:** `31337`  
   - **Currency Symbol:** `ETH`  
3. **Import a Hardhat account** (e.g., Account #0’s private key).  
   - You should see `0xf39F…2266` with 10 000 ETH in MetaMask.

---

### 5. Install & Run IPFS

1. Download and extract **go-ipfs** for Windows to, for example, `C:\ipfs\go-ipfs`.  
2. Add `C:\ipfs\go-ipfs` to your **System PATH** and reopen PowerShell.  
3. Initialize and start IPFS:

   ```powershell
   ipfs init
   ipfs daemon
   ```

- **API server:** `http://127.0.0.1:5001`  
- **Gateway server:** `http://127.0.0.1:8081` _(if you changed from 8080 to 8081)_

---

### 6. Configure IPFS CORS

1. **Stop** the IPFS daemon (close the window if it’s running).  
2. Edit your IPFS config file:
   ```powershell
   notepad C:\Users\Azamat\.ipfs\config
   ```
3. Locate the `"API"` section and update (or add) the `"HTTPHeaders"` object exactly like this:
   ```jsonc
   "API": {
     "HTTPHeaders": {
       "Access-Control-Allow-Origin": [
         "http://localhost:3000"
       ],
       "Access-Control-Allow-Methods": [
         "GET",
         "PUT",
         "POST"
       ],
       "Access-Control-Allow-Headers": [
         "Content-Type"
       ]
     }
   },
   ```
4. **Save** and close the file.  
5. **Restart** the IPFS daemon:
   ```powershell
   ipfs daemon
   ```

Now the React frontend (`http://localhost:3000`) can call the IPFS HTTP API at port 5001.

---

### 7. Generate a Sample VC JWT

1. **Install VC libraries** (if not already done):
   ```bash
   cd identity-vault
   npm install did-jwt did-jwt-vc did-resolver ethr-did-resolver
   ```
2. **Edit** `scripts/generateVC.js` to use your Hardhat account #0’s DID & private key:
   ```js
   // Replace these lines with your own values:
   const issuerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
   const issuerPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
   ```
3. Run the script:
   ```bash
   node scripts/generateVC.js
   ```
4. Copy the printed JWT (starts with “eyJhbGci…”).

---

### 8. Launch the React UI

1. Copy your **favicon.png** into `ui/public/`.  
2. Open `ui/public/index.html` and ensure:
   ```html
   <link rel="icon" href="%PUBLIC_URL%/favicon.png" />
   <title>DigiVault</title>
   ```
3. Verify `ui/src/App.js` has:
   - Title “DigiVault” / Subtitle “Decentralized Identity Vault”  
   - Contract address replaced for `"YOUR_RECOVERY_ADDRESS_HERE"`.  
   - Inline forms, toasts, dark mode, CID history, loading flags, etc.
4. In a new terminal:
   ```bash
   cd identity-vault/ui
   npm install
   npm start
   ```
5. The app auto-opens at `http://localhost:3000`.

---

## How To Use DigiVault

### Issue & Store VC

1. Paste your VC JWT (from Step 7) into the **“Paste VC JWT here…”** textarea.  
2. Click **“Upload VC to IPFS”**.  
   - The button shows “Uploading…” while contacting IPFS.  
   - On success, a toast appears:  
     ```
     Stored VC at QmXYZ…
     ```  
   - The returned CID shows up in the **Uploaded CIDs** history list.

### Verify VC

1. Copy a CID from the **Uploaded CIDs** list (or any valid IPFS CID).  
2. Paste it into the **“Enter CID to verify…”** input.  
3. Click **“Fetch VC from IPFS”**.  
   - The button shows “Fetching…” while retrieving.  
   - On success, you see the **cryptographically verified** credential JSON payload displayed (not just raw JWT).  
   - A toast “VC verified successfully” confirms validity.  
   - If signature verification fails, an inline error appears.

### Confirm Recovery

1. If your account is configured as a guardian when the contract was deployed, you will see a **“Confirm Recovery”** button.  
2. Click it and enter a **new Ethereum address** when prompted by the UI.  
3. MetaMask pops up to sign the transaction.  
4. Once two different guardians have called `confirmRecovery(...)`, the **Contract Owner** field in the UI updates to the new address automatically.

---

## Automated Tests

### Smart-Contract Tests (Hardhat)

Create tests in `test/Recovery.test.js` to validate:

- **Only guardians** can call `confirmRecovery(...)`.  
- **Two confirmations** (from different guardians) are required to change `owner`.  
- **Failure cases**: same guardian twice, non-guardian call, state resets after recovery.


Run tests with:
```bash
npx hardhat test
```

---

### React Component Tests

1. **Add a `test` script** in `ui/package.json`:
   ```json
   "scripts": {
     "start": "react-scripts start",
     "build": "react-scripts build",
     "test": "react-scripts test --env=jsdom"
   }
   ```

2. **Install testing libraries** (if not already done):
   ```bash
   cd ui
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   ```

3. **Create** `ui/src/App.test.js` with the following content:
   ```js
   // ui/src/App.test.js

   import React from "react";
   import { render, screen, act } from "@testing-library/react";
   import "@testing-library/jest-dom";

   // Mock ipfs client
   jest.mock("./ipfs", () => ({
     ipfs: { add: jest.fn().mockResolvedValue({ cid: { toString: () => "QmMockCid" } }) }
   }));

   // Mock ethers module so that import { ethers } yields a usable object
   jest.mock("ethers", () => {
     return {
       providers: {
         Web3Provider: jest.fn().mockImplementation(() => ({
           send: () => Promise.resolve(["0x1234567890123456789012345678901234567890"]),
           getSigner: () => ({})
         })),
       },
     };
   });

   // Mock window.ethereum
   beforeAll(() => {
     global.window.ethereum = { request: jest.fn().mockResolvedValue(["0x1234567890123456789012345678901234567890"]) };
   });

   import App from "./App";

   test("renders DigiVault title and subtitle", async () => {
     await act(async () => {
       render(<App />);
     });
     expect(screen.getByText("DigiVault")).toBeInTheDocument();
     expect(screen.getByText("Decentralized Identity Vault")).toBeInTheDocument();
   });
   ```

4. Run React tests:
   ```bash
   cd ui
   npm test
   ```

This test suite:
- Mocks the IPFS client (`ipfs.add`) to return a fake CID.
- Mocks `ethers.providers.Web3Provider` to simulate a connected wallet.
- Mocks `window.ethereum` to prevent errors on component mount.
- Verifies the UI renders the “DigiVault” title and subtitle.

---

## License

This project is released under the **MIT License**.  
Feel free to fork, modify, and build on DigiVault.

---
