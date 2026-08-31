import React from 'react';
import { Terminal } from 'lucide-react';

export interface LogEntry {
  id: string;
  sender: 'PLAYER' | 'AI';
  message: string;
  timestamp: string;
  type: 'hit' | 'miss' | 'sunk' | 'info';
}

interface GameLogProps {
  logs: LogEntry[];
  playerShots: number;
  playerHits: number;
  aiShots: number;
  aiHits: number;
}

export const GameLog: React.FC<GameLogProps> = ({
  logs,
  playerShots,
  playerHits,
  aiShots,
  aiHits
}) => {
  const playerAccuracy = playerShots > 0 ? Math.round((playerHits / playerShots) * 100) : 0;
  const aiAccuracy = aiShots > 0 ? Math.round((aiHits / aiShots) * 100) : 0;

  return (
    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col h-full w-full max-w-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Combat Feed</span>
        </h4>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          LIVE LOG
        </span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400">Commander (You)</div>
          <div className="text-cyan-300 font-bold mt-0.5">{playerHits} Hits ({playerAccuracy}%)</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400">Tactical AI</div>
          <div className="text-red-400 font-bold mt-0.5">{aiHits} Hits ({aiAccuracy}%)</div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs max-h-56 pr-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-6 italic">Awaiting initial orders...</div>
        ) : (
          logs.map((log) => {
            let textColor = 'text-slate-300';
            if (log.type === 'hit') textColor = 'text-amber-400 font-semibold';
            if (log.type === 'sunk') textColor = 'text-red-400 font-bold animate-pulse';
            if (log.type === 'miss') textColor = 'text-cyan-400/70';

            return (
              <div key={log.id} className="flex items-start gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
                <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                <span className={`shrink-0 font-bold ${log.sender === 'PLAYER' ? 'text-cyan-400' : 'text-indigo-400'}`}>
                  [{log.sender}]
                </span>
                <span className={`break-words ${textColor}`}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
