# DigiVault

**Decentralized Identity Vault**

This project is an **all-OSS, no-cloud** dApp for decentralized identity management.  
It includes:
- A smart contract for social-guardian recovery
- Hardhat setup for a local Ethereum network
- IPFS integration for Verifiable Credential (VC) storage
- React front-end with MetaMask integration
- Inline forms and toasts (no browser `prompt`/`alert`)
- Dark/Light mode toggle
- Uploaded CID history
- Loading indicators & disabled buttons while operations are in progress
- Contract owner display and “Confirm Recovery” flow
- Mobile-friendly, responsive layout
- Custom favicon and branding

---

## Project Structure

```
identity-vault/
├─ contracts/
│ └─ Recovery.sol
├─ scripts/
│ ├─ deploy.js
│ └─ generateVC.js
├─ ui/
│ ├─ public/
│ │ ├─ index.html
│ │ ├─ favicon.png
│ │ ├─ manifest.json
│ │ └─ logo.png ← optional branding image
│ ├─ src/
│ │ ├─ App.js
│ │ ├─ ipfs.js
│ │ ├─ Recovery.json ← ABI wrapper { "abi": [ … ] }
│ │ └─ index.js
│ ├─ package.json
│ └─ …
├─ hardhat.config.js
├─ package.json
├─ README.md
```

---

## Prerequisites

1. **Git**  
2. **Node.js (LTS)**  
3. **Yarn** _(optional)_  
4. **Hardhat** (for local Ethereum)  
5. **IPFS CLI**  
6. **MetaMask** (browser extension)  

---


Refer to the detailed steps below to run locally.

## Getting Started
```bash
unzip identity-vault-fixed2.zip
cd identity-vault

# Install root dependencies
npm install

# Start Hardhat local node
npx hardhat node 
```
- This spins up a local Ethereum JSON-RPC at http://127.0.0.1:8545

- It prints out ten accounts (with 10 000 ETH each) and their private keys.

```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```
- Copy the printed “Recovery deployed to: 0x…” address.

- Edit ui/src/App.js and replace "YOUR_RECOVERY_ADDRESS_HERE" with that deployed address.

```bash
# In a new terminal, start IPFS daemon
ipfs daemon 

# Frontend setup
cd ui
npm install
npm start
```
Frontend will run at http://localhost:3000

# Configure MetaMask
1. Install MetaMask if you haven’t already.
2. Add a custom network:
- Network Name: Hardhat Localhost
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

3. Import a Hardhat account:
- Click MetaMask → Import Account → paste one private key (e.g. Account #0).
- You should see an address like 0xf39F…2266 with 10 000 ETH.

# Install & Run IPFS
1. Download and extract go-ipfs for Windows to, for example, C:\ipfs\go-ipfs.
2. Add C:\ipfs\go-ipfs to your System PATH and reopen PowerShell.
3. Initialize and start IPFS:
```bash
ipfs init
ipfs daemon
```
- API server: http://127.0.0.1:5001
- Gateway server: http://127.0.0.1:8081 (changed from 8080 if it conflicted)
