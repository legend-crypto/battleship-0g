import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LocalAIGame } from './components/LocalAIGame';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerBattle } from './components/MultiplayerBattle';
import { X, Trophy, Swords, Info, ShieldCheck } from 'lucide-react';

export type GameMode = 'LANDING' | 'LOCAL_AI' | 'MULTIPLAYER_LOBBY' | 'MULTIPLAYER_BATTLE';
export type NavTab = 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'ABOUT';

export const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('LANDING');
  const [activeTab, setActiveTab] = useState<NavTab>('PLAY');
  const [activeModal, setActiveModal] = useState<NavTab | null>(null);

  // Multiplayer session data
  const [multiplayerData, setMultiplayerData] = useState<any>(null);

  const handleGoHome = () => {
    setMode('LANDING');
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'PLAY') {
      handleGoHome();
    } else {
      setActiveModal(tab);
    }
  };

  const handleStartLocalAI = () => {
    setMode('LOCAL_AI');
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const handleStartMultiplayer = () => {
    setMode('MULTIPLAYER_LOBBY');
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const handleMatchJoined = (matchData: any) => {
    setMultiplayerData(matchData);
    setMode('MULTIPLAYER_BATTLE');
  };

  const handleExitToLanding = () => {
    setMode('LANDING');
    setMultiplayerData(null);
    setActiveTab('PLAY');
    setActiveModal(null);
  };

  const isDarkConsoleMode = mode === 'LOCAL_AI' || mode === 'MULTIPLAYER_BATTLE' || mode === 'MULTIPLAYER_LOBBY';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkConsoleMode ? 'bg-[#050B0E] text-slate-100' : 'bg-[#F4F7F6] text-slate-900'
    }`}>
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onGoHome={handleGoHome}
        isDarkTheme={isDarkConsoleMode}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col items-center w-full">
        {mode === 'LANDING' && (
          <LandingPage
            onStartLocalAI={handleStartLocalAI}
            onStartMultiplayer={handleStartMultiplayer}
          />
        )}

        {mode === 'LOCAL_AI' && (
          <LocalAIGame onBackToMenu={handleExitToLanding} />
        )}

        {mode === 'MULTIPLAYER_LOBBY' && (
          <div className="w-full max-w-4xl px-4 py-8">
            <MultiplayerLobby
              onMatchReady={handleMatchJoined}
              onBackToMenu={handleExitToLanding}
            />
          </div>
        )}

        {mode === 'MULTIPLAYER_BATTLE' && multiplayerData && (
          <MultiplayerBattle
            matchData={multiplayerData}
            onExit={handleExitToLanding}
          />
        )}
      </main>

      {/* MATCHES Modal */}
      {activeModal === 'MATCHES' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl max-w-lg w-full text-left shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Swords className="w-5 h-5 text-emerald-400" />
              <span>ACTIVE 0G MATCHES</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Live on-chain escrow matches on 0G Galileo Testnet
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <div className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-400 block">MATCH #BAT824</span>
                  <span className="text-[10px] text-slate-500">STAKE: 1.00 0G</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  IN PROGRESS
                </span>
              </div>

              <div className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-300 block">MATCH #NAV192</span>
                  <span className="text-[10px] text-slate-500">STAKE: 0.50 0G</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700 text-[10px] font-bold">
                  WAITING GUEST
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                setMode('MULTIPLAYER_LOBBY');
              }}
              className="w-full mt-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition uppercase cursor-pointer"
            >
              CREATE OR JOIN MATCH
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD Modal */}
      {activeModal === 'LEADERBOARD' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl max-w-lg w-full text-left shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>COMMANDER LEADERBOARD</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Top strategic admirals on 0G Chain
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              <div className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-black text-amber-400 text-sm">#1</span>
                  <div>
                    <span className="font-bold text-slate-200 block">0x714A...4A2C</span>
                    <span className="text-[10px] text-slate-500">14 Wins • 82% Accuracy</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">+14.50 0G</span>
              </div>

              <div className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-black text-slate-400 text-sm">#2</span>
                  <div>
                    <span className="font-bold text-slate-200 block">0x8B91...91C3</span>
                    <span className="text-[10px] text-slate-500">11 Wins • 76% Accuracy</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">+9.00 0G</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ABOUT / DOCS Modal */}
      {activeModal === 'ABOUT' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl max-w-lg w-full text-left shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ABOUT 0G BATTLESHIP</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
              Decentralized naval warfare built on 0G Chain (Galileo Testnet `16602`). Wager 0G tokens, battle in real-time, and claim pooled stake escrow payouts with ECDSA signatures.
            </p>

            <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300 font-sans">
              <div className="flex justify-between">
                <span className="font-mono text-slate-500">Escrow Contract:</span>
                <span className="font-mono text-emerald-400">0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-slate-500">Chain ID:</span>
                <span className="font-mono text-slate-200">16602 (Galileo Testnet)</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
