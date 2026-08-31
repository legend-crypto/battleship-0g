import React, { useState } from 'react';
import { GameMode, BOARD_SIZE } from '@battleship/shared';
import { Anchor, Cpu, Swords, Wallet } from 'lucide-react';
import { LocalAIGame } from './components/LocalAIGame';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerBattle } from './components/MultiplayerBattle';

export const ZERO_G_GALILEO_TESTNET = {
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Chainscan', url: 'https://chainscan-galileo.0g.ai' },
  },
};

export default function App() {
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [multiplayerSession, setMultiplayerSession] = useState<{
    matchId: string;
    matchCode: string;
    playerToken: string;
    playerId: string;
    role: 'host' | 'guest';
    player1Name: string;
    player2Name?: string;
  } | null>(null);

  const handleExitMultiplayer = () => {
    setMultiplayerSession(null);
    setActiveMode(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={handleExitMultiplayer}
        >
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              0G BATTLESHIP
            </h1>
            <p className="text-xs text-slate-400">Decentralized Naval Warfare • 0G Chain</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            0G Galileo Testnet (16602)
          </span>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition text-sm shadow-lg shadow-indigo-500/20">
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        {activeMode === GameMode.LOCAL_AI ? (
          <LocalAIGame onBackToMenu={() => setActiveMode(null)} />
        ) : activeMode === GameMode.MULTIPLAYER ? (
          multiplayerSession ? (
            <MultiplayerBattle
              matchData={multiplayerSession}
              onExit={handleExitMultiplayer}
            />
          ) : (
            <MultiplayerLobby
              onBackToMenu={() => setActiveMode(null)}
              onMatchReady={(session) => setMultiplayerSession(session)}
            />
          )
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="text-center max-w-2xl mb-12">
              <h2 className="text-3xl font-extrabold mb-4 text-white">
                Select Battle Station
              </h2>
              <p className="text-slate-400 text-sm">
                Engage in offline tactical strategy against AI or compete in real-time online PvP with 0G token staking escrows.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full">
              {/* Local AI Card */}
              <div
                onClick={() => setActiveMode(GameMode.LOCAL_AI)}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Local AI Mode</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Single browser tab mode against a smart Hunt & Target AI opponent. Works fully offline without gas fees.
                  </p>
                </div>
                <button className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition shadow-lg shadow-cyan-600/30">
                  Launch vs AI
                </button>
              </div>

              {/* Real-time Multiplayer Card */}
              <div
                onClick={() => setActiveMode(GameMode.MULTIPLAYER)}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition group cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                  Real-Time Socket PvP
                </div>
                <div>
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Swords className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Online Multiplayer</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Real-time online 2-player battles. Create or join room codes, place fleet, and alternate turns live.
                  </p>
                </div>
                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/30">
                  Enter PvP Lobby
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 text-center py-4 text-xs text-slate-500">
        0G Battleship Wave 3 • 10x10 Naval Grid ({BOARD_SIZE}x{BOARD_SIZE})
      </footer>
    </div>
  );
}
