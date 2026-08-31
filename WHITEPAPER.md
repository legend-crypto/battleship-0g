# 0G Battleship Technical Whitepaper

**Decentralized On-Chain Escrow & Real-Time Tactical Naval Strategy Engine on 0G Chain**

*Version 1.0 — August 2026*

---

## Executive Summary

**0G Battleship** is a high-performance, Web3-native tactical naval strategy game powered by **0G Chain** (Zero-Gravity). It combines a framework-agnostic 10x10 grid Battleship engine, an authoritative Socket.io referee server, an audited Hunt-and-Target AI, and smart contract escrow staking (`BattleshipStaking.sol`).

Players can engage in two distinct game modes:
1. **Practice Mode (Offline AI):** A wallet-free tactical environment for training and fleet placement mastery.
2. **Staked Multiplayer & AI Battles:** On-chain escrow staking where players deposit native 0G tokens on **0G Mainnet (Chain ID 16661)** and claim 2x pooled stakes upon verified victory via off-chain ECDSA attestation signatures.

---

## 1. System Architecture

0G Battleship employs a decoupled 4-tier architecture ensuring zero client-side cheating, authoritative move processing, and trustless funds settlement:

```
                  ┌──────────────────────────────────────────┐
                  │             Web3 Frontend                │
                  │   Vite + React + Tailwind + Wagmi/Viem   │
                  └────────────────────┬─────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
         ┌────────────────────────┐        ┌─────────────────────────┐
         │ Authoritative Backend  │        │   0G Mainnet Contract   │
         │   Node.js + Socket.io  │        │  BattleshipStaking.sol  │
         └────────────┬───────────┘        └─────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │     Shared Engine      │
         │  TypeScript Core Rules │
         └────────────────────────┘
```

### 1.1 Shared Game Engine (`/shared`)
- Written in pure TypeScript with zero external dependencies.
- Enforces official 10x10 grid Battleship rules:
  - Fleet composition: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2) = 17 total ship cells.
  - Coordinate system: Columns A–J (0–9), Rows 1–10 (0–9).
  - Move validation: Out-of-bounds protection, overlap detection, duplicate shot prevention.

### 1.2 Authoritative Referee Backend (`/backend`)
- Built with Node.js and Socket.io.
- Prevents client-side move manipulation by maintaining authoritative board states server-side.
- Manages player session tokens, turn timers, and 60-second disconnection grace windows.
- Acts as the cryptographic **Arbiter**: Upon game conclusion, the backend signs an EIP-191 ECDSA attestation hash declaring the winner.

### 1.3 Smart Contract Escrow (`/contracts`)
- Contract: [`BattleshipStaking.sol`](file:///c:/Users/Siddhu/Downloads/battleship/contracts/contracts/BattleshipStaking.sol)
- Deployed on **0G Mainnet** (`0x6114CB30740c77C37971E0468F7662E3ec52e6Cc`).
- Built with Solidity `^0.8.24`, compiled with `evmVersion: "cancun"` and OpenZeppelin ReentrancyGuard.

### 1.4 Web3 User Interface (`/frontend`)
- React + Vite + TailwindCSS + Lucide Icons.
- Wagmi + Viem integration supporting MetaMask and injected Web3 wallets.
- Custom high-contrast tactical command console with radial radar sweep, dual ocean grids, live logs, and post-match accuracy analytics.

---

## 2. Artificial Intelligence Algorithm

The single-player Tactical AI algorithm ([`shared/src/ai.ts`](file:///c:/Users/Siddhu/Downloads/battleship/shared/src/ai.ts)) operates under strict fog-of-war constraints:

### 2.1 Audited Data Access Scoping
- The AI algorithm receives **only** the `trackingGrid` (the 10x10 grid of previous HIT/MISS results) and the list of remaining target vessel sizes.
- **Zero Data Leak:** The AI has **no access** to the player's underlying ship positions or board array prior to hits.

### 2.2 Dual-Phase Search Strategy
1. **Opening / Parity Search (Hunt Mode):**
   - Evaluates a checkerboard parity pattern (`(x + y) % 2 === 0` or shortest remaining ship length parity).
   - Minimizes unnecessary shots by prioritizing coordinates that can fit the smallest unsunk vessel.
2. **Target Mode:**
   - Upon scoring a `HIT`, switches to cardinal direction probing (North, South, East, West).
   - Identifies vessel orientation upon scoring a second consecutive hit and pursues line-firing until the ship is `SUNK`.
   - Reverts to parity opening search once the target ship is destroyed.

---

## 3. Smart Contract Staking & Cryptographic Attestation

### 3.1 Escrow Workflow
1. **Match Creation:** Player 1 calls `createMatch(matchIdBytes32)` sending `N` 0G tokens into the contract.
2. **Match Joining:** Player 2 calls `joinMatch(matchIdBytes32)` sending the exact matching `N` 0G tokens.
3. **Escrow Lockup:** The contract holds `2 * N` 0G tokens securely in escrow.

### 3.2 Off-Chain ECDSA Winner Attestation (Option A)
To eliminate high per-turn gas costs, individual game moves occur off-chain over WebSocket connections. When a player sinks all 5 enemy vessels:

1. Server calculates EIP-191 message hash:
   $$\text{Hash} = \text{keccak256}(\text{abi.encodePacked}("WINNER\_PAYOUT", \text{matchId}, \text{winnerAddress}, \text{totalPayout}))$$
2. Server signs the hash using the trusted Arbiter private key.
3. Winner submits signature via `claimWinnerPayout(matchId, signature)`.
4. Contract executes `ECDSA.recover` verifying signature against stored `arbiter` address and transfers `2 * N` 0G tokens to the winner.

### 3.3 Refund Mechanisms
- **`cancelUnjoinedMatch(matchId)`:** Host can cancel an unjoined lobby and reclaim their deposit.
- **`claimTimeoutRefund(matchId)`:** Emergency timeout refund available after 1 hour if a match remains unsettled.

---

## 4. 0G Mainnet Deployment Parameters

| Parameter | Value |
|---|---|
| **Network Name** | 0G Mainnet |
| **Chain ID** | `16661` |
| **RPC Endpoint** | `https://evmrpc.0g.ai` |
| **Block Explorer** | [https://chainscan.0g.ai](https://chainscan.0g.ai) |
| **Contract Name** | `BattleshipStaking` |
| **Deployed Address** | [`0x6114CB30740c77C37971E0468F7662E3ec52e6Cc`](https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc) |
| **Solidity Version** | `0.8.24` |
| **EVM Target** | `cancun` |
| **Optimizer** | Enabled (`200` runs) |

---

## 5. Tokenomics & Staking Limits

- **Player Stake Range:** `0.01 0G` to `0.10 0G` per match during test-run phase.
- **Prize Pool Scaling:** Total prize pool equals `2x` the player's stake (`0.02 0G` to `0.20 0G`).
- **Notice:** Prize pool caps will be increased following our upcoming ecosystem funding round.

---

## 6. Verification & Security Audit

- **Unit Test Coverage:** 14/14 engine & AI unit tests passing (Vitest).
- **Hardhat Contract Test Suite:** 12/12 smart contract unit tests passing (reentrancy, unauthorized claims, invalid signatures, refund timeouts).
- **On-Chain Mainnet Verification:** 5 live confirmed transactions on 0G Mainnet Explorer.

---

*© 2026 0G Battleship Team. Built for 0G Network.*
