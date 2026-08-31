# ⚓ 0G Battleship

**Decentralized Naval Warfare — Built on 0G Chain**

A classic 10x10 Battleship game reimagined with real-time multiplayer, a
tactical AI opponent, and on-chain staking. Players wager 0G tokens before a
match, battle it out in real time, and the winner claims the pooled stake
directly from a smart contract.

> **Current phase: Wave 3** — multiplayer + local AI gameplay with on-chain
> **staking only**. Full on-chain game logic (move verification, ship
> placement commitments) is planned for Wave 4. See [Roadmap](#-roadmap).

---

## 🎮 Features

- **Local AI Mode** — play instantly against a computer opponent, fully
  offline, no wallet required. The AI uses a checkerboard-parity opening
  search followed by adjacent-cell hunt/target logic once it lands a hit —
  a well-known efficient Battleship-solving strategy, not a shortcut.
- **Real-Time Multiplayer** — create or join a match, place your fleet, and
  battle another player live over WebSockets. Reconnect support for
  page refreshes mid-match.
- **On-Chain Staking (0G Chain)** — before a multiplayer match starts, both
  players stake an equal amount of 0G into an escrow smart contract. The
  winner claims the pooled stake; disconnects/timeouts fall back to a
  refund path.
- **Live Combat Feed** — a real-time log of every shot, hit, and miss for
  both sides, plus running accuracy stats per player.
- **End-of-Match Reveal** — opponent ship positions are revealed only once
  the match concludes, alongside the win/loss result and final accuracy.

---

## 🖥️ Screenshots

| Battle in progress |
|---|
| Targeting radar (enemy grid) next to your own ocean grid, with a live combat feed showing hit/miss history and running accuracy per commander. |

*(Add your own screenshots here as the UI evolves — the app currently
renders a dual-grid battle view with a `LIVE LOG` combat feed panel and
wallet/network status in the header.)*

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite), Tailwind CSS |
| Multiplayer server | Node.js + TypeScript, Socket.io (real-time match sync) |
| Shared game engine | Framework-agnostic TypeScript (`/shared`) — used by both frontend AI mode and backend multiplayer authority |
| Wallet / chain integration | wagmi + viem (or ethers.js v6) |
| Smart contracts | Solidity (`evmVersion: cancun`), Hardhat |
| Chain | 0G Chain (EVM-compatible, Cosmos SDK + Ethermint) |

### 0G Chain network details

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| **Mainnet** | `16661` | `https://evmrpc.0g.ai` | `chainscan.0g.ai` |
| **Galileo Testnet** | `16602` | `https://evmrpc-testnet.0g.ai` | `chainscan-galileo.0g.ai` |

> ⚠️ 0G's testnet has changed chain IDs before (a prior relaunch used
> `16601`). Chain IDs are read from environment config, not hardcoded, so a
> future testnet reset only requires an `.env` update.

---

## 📁 Project Structure

```
0g-battleship/
├── frontend/          # React app — local AI mode, multiplayer lobby, wallet UI
├── backend/           # Socket.io server — authoritative multiplayer match state
├── contracts/         # Solidity staking contract + Hardhat config + tests
├── shared/            # Shared TypeScript game engine + types (board, ship, move, match)
│   ├── src/
│   │   ├── engine.ts  # Board/ship/move resolution logic
│   │   ├── ai.ts      # Local AI targeting logic (hunt/target strategy)
│   │   └── types.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- A wallet (e.g. MetaMask) funded with **testnet** 0G — get some from
  [faucet.0g.ai](https://faucet.0g.ai)

### Installation

```bash
git clone <your-repo-url>
cd 0g-battleship
npm install
```

### Environment Variables

Create `.env.testnet` in `/contracts` (never commit this file):

```
PRIVATE_KEY=your_testnet_private_key
TESTNET_RPC_URL=https://evmrpc-testnet.0g.ai
TESTNET_CHAIN_ID=16602
```

Mainnet config (`.env.mainnet`) is kept **separate** and is only used for
the final, explicit deployment step — see [Deployment](#-deployment).

### Run locally

```bash
# Start the shared engine build (if using workspaces, this may be automatic)
npm run build --workspace=shared

# Start the multiplayer backend
npm run dev --workspace=backend

# Start the frontend
npm run dev --workspace=frontend
```

Local AI mode works immediately with no backend or wallet connection.
Multiplayer mode requires the backend running; staking requires a wallet
connected to 0G Galileo Testnet.

---

## 🎲 Game Modes

### Play vs AI (local)
Fully client-side. Place your fleet (or auto-shuffle), then alternate turns
with the AI. No network calls, no wallet.

### Multiplayer
1. Create or join a match via a match code.
2. Both players place their fleet.
3. *(If staking)* both players stake equal 0G into the contract escrow.
4. Turns alternate in real time; the backend is the authoritative referee
   for all hit/miss resolution.
5. On game over, ship positions are revealed, the winner is shown
   alongside final accuracy for both sides, and the winner can claim the
   staked pool.

---

## 📜 Staking Contract

The `BattleshipStaking` contract handles **staking only** — it does not
verify game moves on-chain (that's Wave 4). Core flow:

1. `createMatch(matchId, stakeAmount)` — proposer stakes into escrow.
2. `joinMatch(matchId)` — opponent matches the stake.
3. Winner is reported via a backend-signed attestation (the backend server,
   which already acts as the authoritative game referee, signs a message
   declaring the winner; the winner submits that signature on-chain to
   claim — this keeps backend gas costs at zero).
4. `claim(matchId, signature)` — winner withdraws the pooled stake.
5. Refund path for matches that never start or time out.

Protected with OpenZeppelin's `ReentrancyGuard` and checks-effects-
interactions ordering on all withdrawal paths.

**Contract is deployed to testnet only until development is fully
verified. Mainnet deployment is a deliberate, separate, manual step.**

---

## ✅ Security Notes

- The local AI's targeting function (`getNextAIMove`) has been audited to
  confirm it receives only the fog-of-war tracking grid (hits/misses) —
  it has no access to the real ship-placement data at any point before a
  cell is actually fired on. See `shared/src/ai.ts`.
- A debug flag `DEBUG_AI_LOGGING` (default `false`) exists in
  `shared/src/ai.ts` to allow re-verifying this at any time without
  changing AI behavior.
- Full contract test suite covers reentrancy attempts, mismatched stakes,
  unauthorized winner declarations, and timeout/refund paths.

---

## 🗺️ Roadmap

- **Wave 3 (current):** multiplayer + local AI gameplay, staking-only
  on-chain integration on 0G Chain testnet, mainnet deploy once fully
  verified.
- **Wave 4 (planned):** move full game logic on-chain — ship placement
  commitments (hash commit-reveal), on-chain move verification, and
  trust-minimized win determination without relying on a backend signer.

---

## 🧪 Testing

```bash
npm run test --workspace=shared      # game engine unit tests
npm run test --workspace=backend     # multiplayer match integration tests
npm run test --workspace=contracts   # Hardhat contract test suite
```

---

## 📦 Deployment

- **Testnet:** `npm run deploy --workspace=contracts -- --network testnet`
- **Mainnet:** only run once development, testing, and full testnet
  verification are complete. Requires explicit `.env.mainnet` config and
  is treated as a standalone, deliberate action — never a default.

---

## 📄 License

MIT (or your license of choice — update this section accordingly).