import React from 'react';
import { Lock, Coins, Radio } from 'lucide-react';
import { LogEntry } from './GameLog';

interface MatchInfoPanelProps {
  playerAddress?: string;
  opponentAddress?: string;
  opponentName?: string;
  isMyTurn: boolean;
  playerShipsLeft: number;
  opponentShipsLeft: number;
  stakeAmountEth?: string;
  turnCount: number;
  logs: LogEntry[];
}

export const MatchInfoPanel: React.FC<MatchInfoPanelProps> = ({
  playerAddress,
  opponentAddress = 'TACTICAL AI',
  opponentName = 'TACTICAL AI',
  isMyTurn,
  playerShipsLeft,
  opponentShipsLeft,
  stakeAmountEth = '0.50',
  turnCount,
  logs
}) => {
  const totalStakeEth = (Number(stakeAmountEth) * 2).toFixed(2);
  const truncatedPlayer = playerAddress ? `${playerAddress.substring(0, 6)}...${playerAddress.substring(playerAddress.length - 4)}` : 'YOU';
  const truncatedOpponent = opponentAddress.startsWith('0x') ? `${opponentAddress.substring(0, 6)}...${opponentAddress.substring(opponentAddress.length - 4)}` : opponentName;

  return (
    <div className="flex flex-col justify-between h-full bg-[#0B151C] border-2 border-[#1E2E3E] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur font-mono">
      <div className="space-y-4">
        {/* MATCH INFO */}
        <div>
          <h4 className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-3 flex items-center justify-between pb-2 border-b border-[#1C2C3C]">
            <span>MATCH INFO</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </h4>

          <div className="p-3 bg-[#081017] border border-[#1C2C3C] rounded-xl space-y-2.5">
            {/* Player 1 (You) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-400">
                  S
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">YOU</span>
                    {isMyTurn && (
                      <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500 px-1.5 py-0.5 rounded uppercase">
                        YOUR TURN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{truncatedPlayer}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-400">{playerShipsLeft}</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">SHIPS LEFT</span>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center text-[10px] font-bold text-slate-400 space-x-2">
              <span className="flex-1 h-[1px] bg-[#1C2C3C]"></span>
              <span>VS</span>
              <span className="flex-1 h-[1px] bg-[#1C2C3C]"></span>
            </div>

            {/* Player 2 / AI */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center font-bold text-xs text-slate-200">
                  P
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{opponentName}</span>
                    {!isMyTurn && (
                      <span className="text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-500 px-1.5 py-0.5 rounded uppercase">
                        TURN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{truncatedOpponent}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-200">{opponentShipsLeft}</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">SHIPS LEFT</span>
              </div>
            </div>
          </div>
        </div>

        {/* STAKE POOL Card */}
        <div className="p-3 bg-[#081017] border border-[#1C2C3C] rounded-xl">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase mb-1">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              STAKE POOL
            </span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50 font-bold">
              <Lock className="w-3 h-3" />
              ESCROWED ON 0G
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-400">{totalStakeEth} 0G</span>
            <span className="text-[11px] text-slate-400 font-bold">{stakeAmountEth} 0G • {stakeAmountEth} 0G</span>
          </div>
        </div>

        {/* TURN COUNTER & RADIAL SWEEP WIDGET */}
        <div className="p-3 bg-[#081017] border border-[#1C2C3C] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">TURN</span>
            <span className="text-2xl font-black text-white">{turnCount}</span>
            <span className="text-[10px] text-emerald-400 block font-bold mt-0.5">
              {isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN"}
            </span>
          </div>

          {/* Animated Radial Radar Widget */}
          <div className="relative w-14 h-14 rounded-full border-2 border-emerald-500/60 bg-[#050B0E] flex items-center justify-center overflow-hidden shadow-inner shadow-emerald-500/30">
            {/* Concentric grid lines */}
            <div className="absolute inset-1 rounded-full border border-emerald-500/30"></div>
            <div className="absolute inset-3 rounded-full border border-emerald-500/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-emerald-500/30"></div>
              <div className="h-full w-[1px] bg-emerald-500/30 absolute"></div>
            </div>

            {/* Sweeping Line */}
            <div className="absolute inset-0 animate-radar-sweep origin-center">
              <div className="w-1/2 h-[1.5px] bg-gradient-to-r from-transparent to-emerald-400 absolute top-1/2 right-0"></div>
            </div>

            {/* Blinking Radar Dot */}
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-3 right-3 shadow-md shadow-emerald-400"></div>
          </div>
        </div>

        {/* BATTLE LOG Feed */}
        <div>
          <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>BATTLE LOG</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </h5>

          <div className="h-32 overflow-y-auto pr-1 space-y-1.5 font-mono text-[11px] bg-[#081017] p-2.5 rounded-xl border border-[#1C2C3C]">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-center py-5 italic text-[10px]">Awaiting battle engagements...</p>
            ) : (
              logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between pb-1 border-b border-[#1C2C3C]">
                  <span className="text-slate-300 truncate max-w-[160px] font-semibold">{log.message}</span>
                  <span className={`font-bold text-[10px] px-1.5 py-0.2 rounded ${
                    log.type === 'hit' || log.type === 'sunk'
                      ? 'bg-red-950 text-red-400 border border-red-500'
                      : log.type === 'miss'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500'
                      : 'text-slate-400'
                  }`}>
                    {log.type === 'hit' || log.type === 'sunk' ? 'HIT' : log.type === 'miss' ? 'MISS' : 'INFO'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
