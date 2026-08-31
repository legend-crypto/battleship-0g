# 0G Mainnet Smart Contract Deployment & Verification Record

This document records the official deployment details, contract configuration, and verified on-chain transactions for **0G Battleship** on **0G Mainnet**.

---

## 1. Network & Contract Specifications

- **Network Name:** 0G Mainnet
- **Chain ID:** `16661`
- **RPC URL:** `https://evmrpc.0g.ai`
- **Block Explorer:** [https://chainscan.0g.ai](https://chainscan.0g.ai)
- **Contract Name:** `BattleshipStaking`
- **Deployed Contract Address:** [`0x6114CB30740c77C37971E0468F7662E3ec52e6Cc`](https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc)
- **Deployer Address:** `0xb5aDc622a510f66E467e603377d62da5667c1f20`
- **Trusted Arbiter Address:** `0xb5aDc622a510f66E467e603377d62da5667c1f20`
- **Solidity Version:** `^0.8.24`
- **EVM Target:** `cancun` (Mandatory for 0G Chain execution)
- **Optimizer:** Enabled (`200` runs)

---

## 2. Executed On-Chain Test Transactions (10 Confirmed Transactions)

10 live transactions have been executed directly on `BattleshipStaking.sol` on 0G Mainnet:

| # | Transaction Type | Status | Block | Tx Hash | 0G Chainscan Explorer Link |
|---|---|---|---|---|---|
| **1** | `createMatch` (Match #1) | ✅ Confirmed | `43146004` | `0xc031007f...f83d` | [View Tx 1](https://chainscan.0g.ai/tx/0xc031007f2df84e1465e63e67f90fe68526bc4ea1124eeb18812e7b63d9f8f83d) |
| **2** | `cancelUnjoinedMatch` (Match #1) | ✅ Confirmed | `43146014` | `0xe5625129...5f2a` | [View Tx 2](https://chainscan.0g.ai/tx/0xe56251296ee549781414c0024196020ce79492cd81ac03f881fd5251b39f5f2a) |
| **3** | `createMatch` (Match #2) | ✅ Confirmed | `43146017` | `0x12522aab...b552` | [View Tx 3](https://chainscan.0g.ai/tx/0x12522aabab88f15a93977d2326537cc5ce7289950d5952a3738c3d001e09b552) |
| **4** | `cancelUnjoinedMatch` (Match #2) | ✅ Confirmed | `43146029` | `0x541f199a...422` | [View Tx 4](https://chainscan.0g.ai/tx/0x541f199a76ebd504aeae34772e0a0d1c9ba237b229239e441b471afa71e9f422) |
| **5** | `setArbiter` | ✅ Confirmed | `43146035` | `0x74c642f6...ab0f` | [View Tx 5](https://chainscan.0g.ai/tx/0x74c642f69bffcc0885070fd54814afb23473023131132bc8caa45fca56afab0f) |
| **6** | `createMatch` (Match #3) | ✅ Confirmed | `43149612` | `0x6463f797...abac8` | [View Tx 6](https://chainscan.0g.ai/tx/0x6463f7978e94b779f58a655f52eb1e812f3cde35bfab2ba4da46acb4084abac8) |
| **7** | `cancelUnjoinedMatch` (Match #3) | ✅ Confirmed | `43149622` | `0x0b1f1517...fd8e` | [View Tx 7](https://chainscan.0g.ai/tx/0x0b1f15176cde2b32af602348699f53df024da1a2565fecb6ed0c1e8cc4a2fd8e) |
| **8** | `createMatch` (Match #4) | ✅ Confirmed | `43149632` | `0x06e947fe...ab02` | [View Tx 8](https://chainscan.0g.ai/tx/0x06e947fe889c6d1274a9aa55c9090d2b3451f3e167dbf158809d28f7b535ab02) |
| **9** | `cancelUnjoinedMatch` (Match #4) | ✅ Confirmed | `43149638` | `0x66bd0935...0ab6` | [View Tx 9](https://chainscan.0g.ai/tx/0x66bd093517dae9a4fc584890ee8e8a2e20d410820db034d5fa3e60dde5f40ab6) |
| **10** | `setArbiter` | ✅ Confirmed | `43149645` | `0x09d3c3e8...a945` | [View Tx 10](https://chainscan.0g.ai/tx/0x09d3c3e81362dd7fee1e0ec4b2f43d9c8ed598b19f1142f27199b8542481a945) |

---

## 3. Direct Explorer Links

- **Mainnet Contract Address:** [https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc](https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc)
- **Deployer Wallet Address:** [https://chainscan.0g.ai/address/0xb5aDc622a510f66E467e603377d62da5667c1f20](https://chainscan.0g.ai/address/0xb5aDc622a510f66E467e603377d62da5667c1f20)

---

## 4. Environment & Deployment Security

- `.env` and `.env.mainnet` are explicitly ignored in `.gitignore`.
- Deployment script [`contracts/scripts/deploy-mainnet.ts`](file:///c:/Users/Siddhu/Downloads/battleship/contracts/scripts/deploy-mainnet.ts) compiles with `evmVersion: "cancun"`.
- Transaction scripts [`contracts/scripts/interact-mainnet.ts`](file:///c:/Users/Siddhu/Downloads/battleship/contracts/scripts/interact-mainnet.ts) and [`contracts/scripts/interact-mainnet-batch2.ts`](file:///c:/Users/Siddhu/Downloads/battleship/contracts/scripts/interact-mainnet-batch2.ts) executed all 10 on-chain mainnet test transactions.

---

*© 2026 0G Battleship Team.*
