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

## 2. Executed On-Chain Test Transactions

5 live transactions were executed directly on `BattleshipStaking.sol` on 0G Mainnet to verify match creation, stake escrow deposits, cancellation refunds, and arbiter state updates:

| # | Transaction Type | Status | Block | Tx Hash | 0G Chainscan Explorer Link |
|---|---|---|---|---|---|
| **1** | `createMatch` (Match #1) | ✅ Confirmed | `43146004` | `0xc031007f...f83d` | [View Tx 1](https://chainscan.0g.ai/tx/0xc031007f2df84e1465e63e67f90fe68526bc4ea1124eeb18812e7b63d9f8f83d) |
| **2** | `cancelUnjoinedMatch` (Match #1) | ✅ Confirmed | `43146014` | `0xe5625129...5f2a` | [View Tx 2](https://chainscan.0g.ai/tx/0xe56251296ee549781414c0024196020ce79492cd81ac03f881fd5251b39f5f2a) |
| **3** | `createMatch` (Match #2) | ✅ Confirmed | `43146017` | `0x12522aab...b552` | [View Tx 3](https://chainscan.0g.ai/tx/0x12522aabab88f15a93977d2326537cc5ce7289950d5952a3738c3d001e09b552) |
| **4** | `cancelUnjoinedMatch` (Match #2) | ✅ Confirmed | `43146029` | `0x541f199a...422` | [View Tx 4](https://chainscan.0g.ai/tx/0x541f199a76ebd504aeae34772e0a0d1c9ba237b229239e441b471afa71e9f422) |
| **5** | `setArbiter` | ✅ Confirmed | `43146035` | `0x74c642f6...ab0f` | [View Tx 5](https://chainscan.0g.ai/tx/0x74c642f69bffcc0885070fd54814afb23473023131132bc8caa45fca56afab0f) |

---

## 3. Direct Explorer Links

- **Mainnet Contract Address:** [https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc](https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc)
- **Deployer Wallet Address:** [https://chainscan.0g.ai/address/0xb5aDc622a510f66E467e603377d62da5667c1f20](https://chainscan.0g.ai/address/0xb5aDc622a510f66E467e603377d62da5667c1f20)

---

## 4. Environment & Deployment Security

- `.env` and `.env.mainnet` are explicitly ignored in `.gitignore`.
- Deployment script [`contracts/scripts/deploy-mainnet.ts`](file:///c:/Users/Siddhu/Downloads/battleship/contracts/scripts/deploy-mainnet.ts) compiles with `evmVersion: "cancun"`.
- Transaction script [`contracts/scripts/interact-mainnet.ts`](file:///c:/Users/Siddhu/Downloads/battleship/contracts/scripts/interact-mainnet.ts) executed all 5 on-chain mainnet test transactions.

---

*© 2026 0G Battleship Team.*
