import React from 'react';
import { X, ExternalLink, ShieldCheck, Cpu, Lock, Coins, FileText, CheckCircle2, Target, ArrowLeft } from 'lucide-react';
import { ZERO_G_MAINNET } from '../config/wagmi';

interface WhitepaperModalProps {
  onClose: () => void;
}

export const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in font-mono overflow-y-auto">
      <div className="bg-[#091015] border border-slate-800 rounded-3xl max-w-4xl w-full text-slate-200 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#050B0E] rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="0G Logo" className="w-9 h-9 object-contain rounded-xl shadow-md" />
            <div>
              <h2 className="text-base font-black text-white tracking-wider flex items-center gap-2">
                <span>0G BATTLESHIP</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  TECHNICAL WHITEPAPER V1.0
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Decentralized On-Chain Escrow & Real-Time Strategy Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Whitepaper Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-xs font-sans text-slate-300 leading-relaxed">
          {/* Executive Summary */}
          <section className="space-y-3 bg-[#050B0E] p-5 rounded-2xl border border-slate-800">
            <h3 className="font-mono text-sm font-black text-emerald-400 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>EXECUTIVE SUMMARY</span>
            </h3>
            <p>
              <strong>0G Battleship</strong> is a high-performance, Web3-native tactical naval strategy game powered by <strong>0G Chain</strong> (Zero-Gravity). It combines a framework-agnostic 10x10 grid Battleship engine, an authoritative Socket.io referee server, an audited Hunt-and-Target AI, and smart contract escrow staking (<code className="text-emerald-400">BattleshipStaking.sol</code>).
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
              <div className="p-3 bg-[#091015] rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-0.5">PRACTICE MODE (OFFLINE)</strong>
                A wallet-free tactical environment for training and fleet placement mastery.
              </div>
              <div className="p-3 bg-[#091015] rounded-xl border border-slate-800/80">
                <strong className="text-emerald-400 block mb-0.5">STAKED AI & MULTIPLAYER</strong>
                Escrow staking on 0G Mainnet with 2x pooled token rewards claimed via off-chain ECDSA attestation.
              </div>
            </div>
          </section>

          {/* 1. Architecture */}
          <section className="space-y-4">
            <h3 className="font-mono text-sm font-black text-white uppercase flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>1. SYSTEM ARCHITECTURE</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4 font-mono text-[11px]">
              <div className="p-4 bg-[#050B0E] rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">1.1 SHARED ENGINE (/shared)</span>
                <p className="text-slate-400 font-sans text-xs">
                  Pure TypeScript Battleship logic with zero dependencies. Enforces 10x10 coordinates, fleet sizes (Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2), and move validation.
                </p>
              </div>

              <div className="p-4 bg-[#050B0E] rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">1.2 AUTHORITATIVE REFEREE (/backend)</span>
                <p className="text-slate-400 font-sans text-xs">
                  Node.js + Socket.io referee server. Maintains server-side fog-of-war state, prevents client move tampering, and acts as the cryptographic Arbiter.
                </p>
              </div>

              <div className="p-4 bg-[#050B0E] rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">1.3 SMART CONTRACT ESCROW (/contracts)</span>
                <p className="text-slate-400 font-sans text-xs">
                  Solidity ^0.8.24 contract with OpenZeppelin ReentrancyGuard, compiled for 0G EVM target <code className="text-emerald-400">cancun</code>. Holds 0G token stakes securely until verified settlement.
                </p>
              </div>

              <div className="p-4 bg-[#050B0E] rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">1.4 WEB3 FRONTEND (/frontend)</span>
                <p className="text-slate-400 font-sans text-xs">
                  Vite + React + Tailwind + Wagmi/Viem integration supporting MetaMask and injected Web3 browser wallets.
                </p>
              </div>
            </div>
          </section>

          {/* 2. AI Algorithm */}
          <section className="space-y-3">
            <h3 className="font-mono text-sm font-black text-white uppercase flex items-center gap-2 pb-2 border-b border-slate-800">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>2. TACTICAL AI ALGORITHM & AUDIT</span>
            </h3>
            <p>
              The single-player Tactical AI (<code className="text-emerald-400">shared/src/ai.ts</code>) operates under strict fog-of-war scoping:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Zero Data Access Leak:</strong> The AI targeting function receives strictly the tracking grid of prior HIT/MISS results and remaining vessel lengths. It has zero access to player ship coordinates.</li>
              <li><strong>Checkerboard Parity Opening Search:</strong> Evaluates coordinates matching optimal vessel length parity to eliminate redundant opening shots.</li>
              <li><strong>Cardinal Target Pursuit:</strong> Upon scoring a hit, probes cardinal directions (N, S, E, W) to lock onto ship alignment until sunk.</li>
            </ul>
          </section>

          {/* 3. Smart Contract & Attestation */}
          <section className="space-y-4">
            <h3 className="font-mono text-sm font-black text-white uppercase flex items-center gap-2 pb-2 border-b border-slate-800">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>3. SMART CONTRACT & CRYPTOGRAPHIC ATTESTATION</span>
            </h3>

            <div className="bg-[#050B0E] p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold block">EIP-191 ECDSA Attestation Signature Scheme:</span>
              <div className="p-3 bg-[#091015] rounded-lg border border-slate-800 text-slate-300 font-mono text-[10px] overflow-x-auto">
                Hash = keccak256(abi.encodePacked("WINNER_PAYOUT", matchIdBytes32, winnerAddress, totalPayoutWei))
              </div>
              <p className="font-sans text-xs text-slate-400">
                Off-chain game moves occur over WebSockets with zero per-turn gas fees. Upon game conclusion, the backend Arbiter signs the payout hash, enabling the winner to invoke <code className="text-emerald-400">claimWinnerPayout</code> on-chain.
              </p>
            </div>
          </section>

          {/* 4. 0G Mainnet Contract Info */}
          <section className="space-y-3 bg-[#050B0E] p-5 rounded-2xl border border-emerald-500/30">
            <h3 className="font-mono text-sm font-black text-emerald-400 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>4. 0G MAINNET DEPLOYMENT DETAILS</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Smart Contract Address:</span>
                <span className="text-white font-bold text-xs break-all">0x6114CB30740c77C37971E0468F7662E3ec52e6Cc</span>
              </div>
              <div>
                <span className="text-slate-500 block">Network / Chain ID:</span>
                <span className="text-emerald-400 font-bold">0G Mainnet (Chain ID 16661)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`${ZERO_G_MAINNET.blockExplorers.default.url}/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 underline hover:text-emerald-300"
              >
                <span>View Verified Contract on 0G Chainscan Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>

          {/* 5. Tokenomics */}
          <section className="space-y-2">
            <h3 className="font-mono text-sm font-black text-white uppercase flex items-center gap-2 pb-2 border-b border-slate-800">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>5. TOKENOMICS & STAKING LIMITS</span>
            </h3>
            <p>
              Match stakes are configured between <strong>0.01 0G</strong> and <strong>0.10 0G</strong> per match during the initial test-run phase. Winners claim 2x pooled stakes on-chain. Prize pool caps will scale following our ecosystem funding round.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#050B0E] rounded-b-3xl flex items-center justify-between font-mono text-xs">
          <span className="text-slate-500">&copy; 2026 0G Battleship Team</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer"
          >
            CLOSE WHITEPAPER
          </button>
        </div>
      </div>
    </div>
  );
};
