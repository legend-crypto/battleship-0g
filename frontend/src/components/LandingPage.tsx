import React from 'react';
import {
  Swords,
  Target,
  ShieldCheck,
  Cpu,
  Coins,
  Eye,
  RefreshCw,
  Zap,
  Lock,
  Anchor,
  Play,
  ExternalLink
} from 'lucide-react';

interface LandingPageProps {
  onStartLocalAI: () => void;
  onStartMultiplayer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartLocalAI, onStartMultiplayer }) => {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between bg-[#F4F7F6] text-slate-900 bg-light-tactical-grid overflow-x-hidden">
      {/* Background Warship Image Blended on Right Side for Hero */}
      <div className="absolute top-0 right-0 w-full lg:w-[65%] h-[850px] pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/bg-battleship.jpg"
          alt="0G Warship"
          className="w-full h-full object-cover object-right opacity-90 filter brightness-105 contrast-105"
        />
        {/* Soft mist gradient blending image left into background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F7F6] via-[#F4F7F6]/80 to-transparent w-full lg:w-[60%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F7F6] via-transparent to-[#F4F7F6] h-full"></div>
      </div>

      {/* Radar Rings Overlay */}
      <div className="absolute top-0 inset-x-0 h-[850px] bg-radar-rings pointer-events-none z-0"></div>

      {/* ---------------- HERO SECTION ---------------- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-16 lg:pt-16 lg:pb-24 flex flex-col justify-center">
        <div className="max-w-xl">
          {/* Official Emblem Logo */}
          <div className="mb-4">
            <img
              src="/logo.png"
              alt="0G Battleship Official Emblem"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl shadow-xl shadow-emerald-500/20"
            />
          </div>

          {/* Tagline */}
          <p className="text-xs font-mono font-black text-emerald-700 tracking-[0.25em] uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            STRATEGY. FOCUS. VICTORY.
          </p>

          {/* Ultra-Readable Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight mb-6 leading-tight drop-shadow">
            <span className="text-emerald-600 font-mono font-black drop-shadow-sm">0G</span>{' '}
            <span className="text-slate-950 font-black">BATTLESHIP</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-700 text-base sm:text-lg font-sans font-semibold leading-relaxed mb-10 max-w-md drop-shadow-sm">
            Outwit 0G's Decentralized AI Agent/your Friends and sink their fleet. <br />
            The ocean is yours to dominate.
          </p>

          {/* Game Mode Cards */}
          <div className="space-y-4 max-w-md">
            {/* Play vs 0G DeAI Card */}
            <div
              onClick={onStartLocalAI}
              className="group p-5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 shadow-2xl shadow-slate-950/20 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-base font-black text-white tracking-wide group-hover:text-emerald-400 transition">
                      BATTLE 0G DeAI AGENT
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                      0G DeAI NODE
                    </span>
                  </div>
                  <p className="text-xs font-sans text-slate-400 font-medium">Single player vs 0G AI Compute Network</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            {/* Multiplayer Staking Card */}
            <div
              onClick={onStartMultiplayer}
              className="group p-5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-emerald-500/40 hover:border-emerald-500 shadow-xl shadow-emerald-500/10 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Swords className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-base font-black text-slate-900 tracking-wide group-hover:text-emerald-600 transition">
                      MULTIPLAYER STAKING
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      ON-CHAIN 0G MAINNET
                    </span>
                  </div>
                  <p className="text-xs font-sans text-slate-600 font-medium">Stake 0G tokens & battle live players</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <div className="relative z-10 w-full bg-[#091015] text-white py-20 px-6 md:px-12 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 font-mono">
            <span className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase">
              COMMAND TACTICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">HOW IT WORKS</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans">
              4 simple steps to deploy your naval fleet, stake 0G tokens, and dominate the high seas against 0G DeAI.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3 font-mono">
              <span className="text-2xl font-black text-emerald-400">01</span>
              <h4 className="text-sm font-bold text-white uppercase">CONNECT & CHOOSE</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Connect your Web3 wallet (MetaMask) to 0G Mainnet or select offline single-player AI mode.
              </p>
            </div>

            <div className="p-6 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3 font-mono">
              <span className="text-2xl font-black text-emerald-400">02</span>
              <h4 className="text-sm font-bold text-white uppercase">DEPLOY FLEET</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Position your 5 naval vessels on the 10x10 tactical ocean grid with horizontal/vertical rotation.
              </p>
            </div>

            <div className="p-6 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3 font-mono">
              <span className="text-2xl font-black text-emerald-400">03</span>
              <h4 className="text-sm font-bold text-white uppercase">STAKE 0G TOKENS</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Deposit equal 0G tokens into the smart contract escrow before battle engagement starts.
              </p>
            </div>

            <div className="p-6 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3 font-mono">
              <span className="text-2xl font-black text-emerald-400">04</span>
              <h4 className="text-sm font-bold text-white uppercase">CLAIM VICTORY</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Sink all enemy ships to claim the 2x pooled 0G token stake via signed cryptographic attestation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SYSTEM CAPABILITIES ---------------- */}
      <div className="relative z-10 w-full py-20 px-6 md:px-12 bg-[#F4F7F6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 font-mono">
            <span className="text-xs font-black tracking-[0.2em] text-emerald-600 uppercase">
              PLATFORM FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">SYSTEM CAPABILITIES</h2>
            <p className="text-slate-600 text-xs sm:text-sm font-sans">
              Engineered with 0G Decentralized AI inference and on-chain escrow security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-mono text-sm font-black text-slate-900 uppercase">0G DECENTRALIZED AI ENGINE</h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Powered by 0G DeAI compute infrastructure for zero-bias, verifiable naval tactical strategy (0G NavalNet-v2).
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-mono text-sm font-black text-slate-900 uppercase">TACTICAL PARITY SEARCH</h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Smart Hunt & Target algorithm utilizing checkerboard parity opening search without hidden player data access.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-mono text-sm font-black text-slate-900 uppercase">0G ON-CHAIN ESCROW</h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Smart contract escrow (`BattleshipStaking.sol`) deployed at `0x6114CB30740c77C37971E0468F7662E3ec52e6Cc` on 0G Mainnet.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-mono text-sm font-black text-slate-900 uppercase">POST-MATCH SHIP REVEAL</h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                End-of-game opponent ship placement reveal and precision accuracy analytics modal.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-mono text-sm font-black text-slate-900 uppercase">DISCONNECT PROTECTION</h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                60-second grace window for page refreshes mid-match, plus emergency 1-hour timeout refund paths.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="font-mono text-sm font-black text-slate-900 uppercase">BUILT FOR 0G CHAIN</h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Direct EVM integration targeting 0G Mainnet (`16661`) and 0G Galileo Testnet (`16602`).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- FLEET SPECIFICATIONS ---------------- */}
      <div className="relative z-10 w-full bg-[#091015] text-white py-20 px-6 md:px-12 border-t border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase">
              VESSEL RECONNAISSANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">STANDARD FLEET COMPOSITION</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans">
              Each commander controls 5 naval vessels spanning 17 total grid target cells.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase">CARRIER</span>
                <span className="text-emerald-400 font-bold">5 CELLS</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 flex-1 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase">BATTLESHIP</span>
                <span className="text-emerald-400 font-bold">4 CELLS</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 flex-1 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase">CRUISER</span>
                <span className="text-emerald-400 font-bold">3 CELLS</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 flex-1 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase">SUBMARINE</span>
                <span className="text-emerald-400 font-bold">3 CELLS</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 flex-1 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase">DESTROYER</span>
                <span className="text-emerald-400 font-bold">2 CELLS</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-4 flex-1 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- CTA FOOTER ---------------- */}
      <footer className="relative z-10 w-full bg-[#050B0E] border-t border-slate-800 py-12 px-6 md:px-12 font-mono text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="0G Battleship Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-md shadow-emerald-500/20"
            />
            <div>
              <div className="text-white font-bold text-sm">0G BATTLESHIP</div>
              <div className="text-[10px] text-emerald-400">NAVAL WARFARE ON 0G MAINNET</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button onClick={onStartLocalAI} className="hover:text-emerald-400 transition cursor-pointer">
              BATTLE 0G DeAI AGENT
            </button>
            <button onClick={onStartMultiplayer} className="hover:text-emerald-400 transition cursor-pointer">
              MULTIPLAYER STAKING
            </button>
            <a
              href="https://chainscan.0g.ai/address/0x6114CB30740c77C37971E0468F7662E3ec52e6Cc"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <span>0G MAINNET EXPLORER</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-center md:text-right text-[10px]">
            &copy; 2026 0G Battleship. Built for 0G Network.
          </div>
        </div>
      </footer>
    </div>
  );
};
