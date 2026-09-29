# Certificate Verification System (Ethereum + React)

A minimal, beginner-friendly Certificate Verification System powered by an Ethereum smart contract and a React frontend.

- **No backend server, no database, no IPFS.**
- Only certificate metadata and a SHA-256 hash are recorded on-chain.
- The PDF is generated in the browser using jsPDF, hashed client-side with the Web Crypto API, and directly downloaded.
- Verifiers can check authenticity by certificate ID or by uploading the original PDF. Read-only verification works without connecting a wallet.

---

## Tech Stack

- **Smart Contract:** Solidity `^0.8.20`
- **Tooling & Local Chain:** Hardhat + `@nomicfoundation/hardhat-toolbox`
- **Frontend:** React 19, Vite, Tailwind CSS, React Router v7
- **Web3:** ethers.js v6 + MetaMask
- **PDF & Cryptography:** jsPDF (client-side generation) & Web Crypto API (SHA-256)

---

## Project Structure

```text
├── contracts/
│   └── CertificateRegistry.sol      # Solidity smart contract
├── scripts/
│   └── deploy.js                    # Hardhat deployment script
├── test/
│   └── CertificateRegistry.test.js  # Contract unit tests (5 passing)
├── hardhat.config.js                # Hardhat network & compiler configuration
├── package.json                     # Root dependencies & scripts
└── frontend/
    ├── .env                         # Contract address & RPC URL
    ├── .env.example                 # Example environment variables
    ├── index.html                   # HTML entrypoint
    ├── tailwind.config.js           # Tailwind CSS configuration
    └── src/
        ├── abi/
        │   └── CertificateRegistry.json # Contract ABI
        ├── components/
        │   └── Header.jsx           # Minimal header & wallet connect button
        ├── lib/
        │   ├── contract.js          # ethers.js helpers (read-only & signer)
        │   └── pdf.js               # jsPDF layout & SHA-256 hashing
        ├── pages/
        │   ├── Issue.jsx            # Certificate creation & PDF download
        │   └── Verify.jsx           # Verification by ID or PDF upload
        ├── App.jsx                  # Routing & wallet connection state
        ├── index.css                # Minimal Tailwind styling
        └── main.jsx                 # React root render
```

---

## Step-by-Step Setup & Run Instructions

### 1. Install Dependencies

In the root directory (for Hardhat):
```bash
npm install
```

In the `frontend` directory:
```bash
cd frontend
npm install
cd ..
```

---

### 2. Run Smart Contract Tests

Verify that the contract compiles and passes all tests:
```bash
npm test
```

Expected output:
```text
  CertificateRegistry
    ✔ should set the deployer as owner
    ✔ should allow owner to issue a certificate successfully
    ✔ should revert if duplicate certId is used
    ✔ should revert if duplicate pdfHash is used
    ✔ should revert if non-owner tries to issue a certificate

  5 passing (600ms)
```

---

### 3. Start Local Hardhat Node

Start the local Ethereum JSON-RPC node in a separate terminal:
```bash
npx hardhat node
```
This runs at `http://127.0.0.1:8545` and prints 20 pre-funded test accounts with their private keys. Keep this terminal open.

---

### 4. Deploy the Smart Contract

In another terminal, deploy `CertificateRegistry` to the local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

You will see output similar to:
```text
CertificateRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

### 5. Configure Frontend Environment Variables

Check `frontend/.env` and verify `VITE_CONTRACT_ADDRESS` matches the deployed address:

```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://127.0.0.1:8545
```

---

### 6. Start the React Frontend

From the `frontend` directory:
```bash
cd frontend
npm run dev
```

Open the browser at `http://localhost:5173`.

---

## Configuring MetaMask

### Step A: Add the Hardhat Localhost Network
1. Open the MetaMask extension.
2. Click the network dropdown in the top-left corner -> **Add network** -> **Add a network manually**.
3. Fill in the network details:
   - **Network Name:** `Hardhat Localhost`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Click **Save** and switch to this network.

### Step B: Import the Owner Test Account
Only the contract deployer (the owner) is authorized to issue certificates.
1. Look at the terminal running `npx hardhat node`.
2. Locate **Account #0**:
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. In MetaMask:
   - Click the account avatar / dropdown at the top.
   - Click **Add account or hardware wallet** -> **Import account**.
   - Paste the private key (`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
   - Click **Import**.
4. You will now see 10,000 ETH available on Hardhat Localhost.

---

## How It Works

### Issuing a Certificate
1. Go to the **Issue** tab (`/`).
2. Click **Connect Wallet** in the header and select Account #0.
3. Fill out the student name, course name, institution, and issue date.
4. Click **Issue Certificate**:
   - The app generates the PDF client-side using `jsPDF`.
   - The app hashes the raw PDF ArrayBuffer via `crypto.subtle.digest("SHA-256", ...)`.
   - The transaction is sent to MetaMask to call `issueCertificate(...)`.
   - Once mined, a "Download PDF" button appears to download the exact binary that was hashed.

### Verifying a Certificate
1. Go to the **Verify** tab (`/verify`).
2. **By Certificate Number:** Enter the certificate ID (e.g. `CERT-2026-XXXXXX`) and click **Verify**.
3. **By PDF Upload:** Upload any PDF certificate file. The browser hashes the file locally without uploading it and calls `verifyByHash(...)`.
4. A green panel appears if valid with all metadata, or a red panel appears if invalid.
5. **No wallet connection is required** for verification (uses ethers `JsonRpcProvider`).
