import React from 'react';
import {
  Target,
  Users,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Crosshair,
  Coins,
  Radio,
  BarChart3,
  Flame,
  Award,
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
          {/* Tagline */}
          <p className="text-xs font-mono font-bold text-emerald-600 tracking-[0.25em] uppercase mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            STRATEGY. FOCUS. VICTORY.
          </p>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-slate-900 mb-6 leading-tight">
            <span className="text-emerald-500 font-mono">0G</span> BATTLESHIP
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-base sm:text-lg font-sans font-medium leading-relaxed mb-10 max-w-md">
            Outwit your opponent and sink their fleet. <br />
            The ocean is yours to dominate.
          </p>

          {/* Game Mode Cards */}
          <div className="space-y-4 max-w-md">
            {/* Play vs AI Card */}
            <div
              onClick={onStartLocalAI}
              className="group p-5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 shadow-2xl shadow-slate-950/20 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-mono text-base font-black text-white tracking-wide group-hover:text-emerald-400 transition">
                    PLAY VS AI
                  </h3>
                  <p className="text-xs font-sans text-slate-400 font-medium">Single player (Offline)</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* Find Opponent Card */}
            <div
              onClick={onStartMultiplayer}
              className="group p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-xl shadow-slate-300/40 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-mono text-base font-black text-slate-900 tracking-wide group-hover:text-emerald-600 transition">
                    FIND OPPONENT
                  </h3>
                  <p className="text-xs font-sans text-slate-500 font-medium">Multiplayer (Stake 0G)</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-500 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Badges Strip */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 border-y border-slate-200/80 bg-white/60 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold text-slate-900 uppercase">BUILT ON 0G</h4>
              <p className="text-[11px] font-sans text-slate-500">High performance decentralized cloud</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold text-slate-900 uppercase">SECURE & FAIR</h4>
              <p className="text-[11px] font-sans text-slate-500">Stake. Compete. Claim your victory.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold text-slate-900 uppercase">STRATEGY FIRST</h4>
              <p className="text-[11px] font-sans text-slate-500">Pure skill. Better decisions win.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 1: HOW IT WORKS ---------------- */}
      <section className="relative z-10 w-full py-16 lg:py-24 bg-white/70 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              TACTICAL WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-slate-900 mt-4 mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-sans">
              Experience transparent naval warfare powered by real-time WebSockets and smart contract token staking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-black text-emerald-500/40 block mb-3">01</span>
                <h3 className="font-mono text-base font-bold text-slate-900 mb-2">CONNECT & CHOOSE</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Connect your MetaMask wallet to 0G Galileo Testnet (`16602`) or select offline single-player AI mode.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600">
                <Coins className="w-4 h-4" />
                <span>0G Token Ready</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-black text-emerald-500/40 block mb-3">02</span>
                <h3 className="font-mono text-base font-bold text-slate-900 mb-2">DEPLOY FLEET</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Strategically position your 5 naval vessels on the 10x10 ocean grid using horizontal or vertical rotation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600">
                <Anchor className="w-4 h-4" />
                <span>5 Fleet Ships</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-black text-emerald-500/40 block mb-3">03</span>
                <h3 className="font-mono text-base font-bold text-slate-900 mb-2">STAKE 0G TOKENS</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Both commanders deposit equal 0G tokens into the `BattleshipStaking.sol` smart contract escrow.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600">
                <Lock className="w-4 h-4" />
                <span>Escrow Locked</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-black text-emerald-500/40 block mb-3">04</span>
                <h3 className="font-mono text-base font-bold text-slate-900 mb-2">CLAIM VICTORY</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Sink all enemy ships! The winner receives a signed off-chain attestation to claim the 2x pooled 0G stake.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Payout Claim</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 2: CORE FEATURES ---------------- */}
      <section className="relative z-10 w-full py-16 lg:py-24 bg-[#050B0E] text-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-950/80 rounded-full border border-emerald-500/40">
              SYSTEM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-white mt-4 mb-4">
              WHY PLAY 0G BATTLESHIP?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-sans">
              Engineered with pure TypeScript game logic, real-time Socket.io state sync, and cryptographically verified on-chain claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#091015] border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono text-base font-bold text-white mb-2">Authoritative Socket Server</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Backend referee server evaluates all hits, misses, and ship destructions to ensure zero client-side manipulation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#091015] border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Cpu className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono text-base font-bold text-white mb-2">Tactical Parity AI</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Play against a smart Hunt & Target AI utilizing checkerboard parity search and orthogonal hit-chain tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#091015] border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono text-base font-bold text-white mb-2">0G On-Chain Escrow</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                `BattleshipStaking.sol` smart contract handles stake matching, non-reentrant security, and EIP-191 winner signature claims.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#091015] border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono text-base font-bold text-white mb-2">Post-Match Ship Reveal</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Full end-of-game opponent fleet reveal showing all unhit ship locations alongside precision accuracy analytics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#091015] border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Radio className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono text-base font-bold text-white mb-2">Disconnect Protection</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                60-second reconnect grace window for page refreshes mid-match, plus 1-hour lockup timeout refund paths.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#091015] border border-slate-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Crosshair className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono text-base font-bold text-white mb-2">Built for 0G Galileo Testnet</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Targeting 0G Galileo Testnet (Chain ID `16602`, RPC `evmrpc-testnet.0g.ai`) for zero-friction Web3 testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 3: FLEET VESSEL SPECS ---------------- */}
      <section className="relative z-10 w-full py-16 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              NAVAL ARSENAL
            </span>
            <h2 className="text-3xl font-black font-mono text-slate-900 mt-3 mb-2">
              STANDARD FLEET COMPOSITION
            </h2>
            <p className="text-slate-600 text-xs font-sans">
              Each commander commands 5 vessels totaling 17 hull grid points.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 block">CARRIER</span>
              <span className="text-[10px] text-slate-500 block mb-2">5 GRID CELLS</span>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 block">BATTLESHIP</span>
              <span className="text-[10px] text-slate-500 block mb-2">4 GRID CELLS</span>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 block">CRUISER</span>
              <span className="text-[10px] text-slate-500 block mb-2">3 GRID CELLS</span>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 block">DESTROYER</span>
              <span className="text-[10px] text-slate-500 block mb-2">2 GRID CELLS</span>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm"></div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 block">SUBMARINE</span>
              <span className="text-[10px] text-slate-500 block mb-2">2 GRID CELLS</span>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 4: CALL TO ACTION BANNER & FOOTER ---------------- */}
      <footer className="relative z-10 w-full bg-[#050B0E] text-slate-400 border-t border-slate-800">
        {/* CTA Box */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#091015] to-[#050B0E] border border-slate-800 shadow-2xl max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mb-3">
              READY TO COMMAND THE OCEAN?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8 font-sans">
              Test your naval tactics against our AI or stake 0G tokens against real human commanders worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartLocalAI}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span>PLAY VS AI (OFFLINE)</span>
              </button>
              <button
                onClick={onStartMultiplayer}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>MULTIPLAYER STAKING LOBBY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Sub-bar */}
        <div className="border-t border-slate-900 py-6 px-6 md:px-12 font-mono text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-emerald-400">0G BATTLESHIP</span>
            <span>• Decentralized Naval Warfare on 0G Galileo Testnet</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://chainscan-galileo.0g.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <span>0G Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>Contract: 0x5FbD...80aa3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
