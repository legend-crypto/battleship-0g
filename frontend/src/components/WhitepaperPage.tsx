import React from 'react';
import { ArrowLeft, ExternalLink, ShieldCheck, Cpu, Lock, Coins, FileText, CheckCircle2, Target, BookOpen, Layers, Terminal } from 'lucide-react';
import { ZERO_G_MAINNET } from '../config/wagmi';
import { BATTLESHIP_STAKING_ADDRESS } from '../config/contract';

interface WhitepaperPageProps {
  onBackToHome: () => void;
}

export const WhitepaperPage: React.FC<WhitepaperPageProps> = ({ onBackToHome }) => {
  return (
    <div className="w-full min-h-screen bg-[#050B0E] text-slate-200 font-mono flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="w-full bg-[#091015] border-b border-slate-800 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </button>

        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="0G Logo" className="w-8 h-8 object-contain rounded-xl shadow-md" />
          <span className="text-xs font-black text-white tracking-widest hidden sm:inline-block">
            0G BATTLESHIP TECHNICAL WHITEPAPER
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
            V1.0 MAINNET
          </span>
        </div>

        <a
          href={`${ZERO_G_MAINNET.blockExplorers.default.url}/address/${BATTLESHIP_STAKING_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
        >
          <span className="hidden sm:inline">EXPLORER</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Page Container */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex-1 space-y-12">
        {/* Title Hero Card */}
        <div className="bg-[#091015] p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <span className="text-xs font-black tracking-[0.25em] text-emerald-400 uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              OFFICIAL PROTOCOL SPECIFICATION
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              0G BATTLESHIP WHITEPAPER
            </h1>

            <p className="text-slate-400 font-sans text-sm sm:text-base max-w-2xl leading-relaxed">
              Decentralized On-Chain Escrow & Real-Time Tactical Naval Strategy Engine on 0G Chain.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Author: <strong className="text-emerald-400">0G Battleship Team</strong>
              </span>
              <span className="bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Network: <strong className="text-emerald-400">0G Mainnet (16661)</strong>
              </span>
              <span className="bg-[#050B0E] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Contract: <strong className="text-slate-200">BattleshipStaking.sol</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-emerald-400 uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="w-5 h-5" />
            <span>EXECUTIVE SUMMARY</span>
          </h2>
          <div className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed space-y-3">
            <p>
              <strong>0G Battleship</strong> is a Web3-native tactical naval strategy game powered by <strong>0G Chain</strong> (Zero-Gravity). It combines a framework-agnostic 10x10 grid Battleship engine, an authoritative Socket.io referee server, an audited Hunt-and-Target AI, and smart contract escrow staking (<code className="text-emerald-400">BattleshipStaking.sol</code>).
            </p>
            <p>
              Players can engage in two distinct game modes:
            </p>
            <div className="grid md:grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-1">
                <strong className="text-white block text-sm">1. PRACTICE MODE (OFFLINE)</strong>
                <p className="text-slate-400 font-sans text-xs">
                  A wallet-free tactical environment for training and fleet placement mastery.
                </p>
              </div>
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/30 space-y-1">
                <strong className="text-emerald-400 block text-sm">2. STAKED AI & MULTIPLAYER</strong>
                <p className="text-slate-400 font-sans text-xs">
                  On-chain escrow staking on 0G Mainnet (Chain ID 16661). Players claim 2x pooled stakes upon verified victory via off-chain EIP-191 ECDSA attestation signatures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Architecture */}
        <section className="space-y-6 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>1. DECOUPLED 4-TIER ARCHITECTURE</span>
          </h2>

          <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <span className="text-slate-500 uppercase font-bold">System Flow Overview:</span>
            <pre className="text-emerald-400 text-[11px] leading-relaxed">
{`  [ Web3 Frontend (Vite + React + Wagmi/Viem) ]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[ Authoritative Backend ]     [ 0G Mainnet Escrow ]
 (Node.js + Socket.io)     (BattleshipStaking.sol)
         │
         ▼
[ Shared TS Core Engine ]`}
            </pre>
          </div>

          <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.1 SHARED ENGINE (/shared)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Pure TypeScript Battleship engine with zero external dependencies. Enforces 10x10 coordinates, fleet composition (Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2 = 17 total cells), and move processing.
              </p>
            </div>

            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.2 REFEREE SERVER (/backend)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Authoritative Socket.io referee server. Maintains server-side fog-of-war state, prevents client move tampering, and acts as the cryptographic Arbiter.
              </p>
            </div>

            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.3 ESCROW CONTRACT (/contracts)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Solidity ^0.8.24 contract with OpenZeppelin ReentrancyGuard, compiled for 0G EVM target <code className="text-emerald-400">cancun</code>. Holds 0G token stakes securely until verified settlement.
              </p>
            </div>

            <div className="p-5 bg-[#050B0E] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">1.4 WEB3 FRONTEND (/frontend)</span>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Vite + React + Tailwind + Wagmi/Viem integration supporting MetaMask and injected Web3 browser wallets.
              </p>
            </div>
          </div>
        </section>

        {/* 2. AI Algorithm */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>2. TACTICAL AI ALGORITHM & FOG-OF-WAR AUDIT</span>
          </h2>
          <div className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed space-y-3">
            <p>
              The single-player Tactical AI (<code className="text-emerald-400">shared/src/ai.ts</code>) operates under strict fog-of-war scoping:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">AUDITED DATA ACCESS SCOPING:</strong>
                <p className="text-slate-400 font-sans text-xs">
                  The AI targeting function receives strictly the tracking grid of prior HIT/MISS results and remaining vessel lengths. It has zero access to player ship coordinates prior to hits.
                </p>
              </div>
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">CHECKERBOARD PARITY SEARCH:</strong>
                <p className="text-slate-400 font-sans text-xs">
                  Evaluates coordinates matching optimal vessel length parity to eliminate redundant opening shots.
                </p>
              </div>
              <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">CARDINAL TARGET PURSUIT:</strong>
                <p className="text-slate-400 font-sans text-xs">
                  Upon scoring a hit, probes cardinal directions (N, S, E, W) to lock onto ship alignment until sunk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Cryptographic Attestation */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>3. CRYPTOGRAPHIC ATTESTATION SCHEME</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
            <p>
              To eliminate high per-turn gas fees, individual game moves occur off-chain over WebSocket connections. When a player sinks all 5 enemy vessels, the server generates an off-chain EIP-191 ECDSA attestation signature:
            </p>
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/40 font-mono text-xs space-y-2">
              <span className="text-emerald-400 font-bold block">EIP-191 Signed Message Hash:</span>
              <div className="p-3 bg-[#091015] rounded-xl border border-slate-800 text-slate-200 text-[11px] overflow-x-auto">
                keccak256(abi.encodePacked("WINNER_PAYOUT", matchIdBytes32, winnerAddress, totalPayoutWei))
              </div>
            </div>
          </div>
        </section>

        {/* 4. Mainnet Specs */}
        <section className="space-y-4 bg-[#091015] p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-xl">
          <h2 className="text-lg font-black text-emerald-400 uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5" />
            <span>4. 0G MAINNET CONTRACT SPECIFICATIONS</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Contract Address:</span>
              <span className="text-white font-bold text-xs break-all">{BATTLESHIP_STAKING_ADDRESS}</span>
            </div>
            <div className="p-4 bg-[#050B0E] rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Network / Chain ID:</span>
              <span className="text-emerald-400 font-bold">0G Mainnet (Chain ID 16661)</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`${ZERO_G_MAINNET.blockExplorers.default.url}/address/${BATTLESHIP_STAKING_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 underline hover:text-emerald-300"
            >
              <span>View Verified Contract on 0G Chainscan Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="w-full bg-[#091015] border-t border-slate-800 py-6 px-6 md:px-12 font-mono text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="0G Logo" className="w-6 h-6 object-contain" />
          <span>&copy; 2026 0G Battleship Team. Built for 0G Network.</span>
        </div>

        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer"
        >
          RETURN TO HOME
        </button>
      </footer>
    </div>
  );
};
