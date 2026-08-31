import React from 'react';
import { FLEET_SHIPS, SHIP_SIZES, ShipPlacement, ShipType } from '@battleship/shared';
import { Target, Flag } from 'lucide-react';

interface FleetPanelProps {
  ships: ShipPlacement[];
  onSurrender?: () => void;
}

export const FleetPanel: React.FC<FleetPanelProps> = ({ ships, onSurrender }) => {
  const getShipStatus = (type: ShipType) => {
    const placed = ships.find((s) => s.type === type);
    if (!placed) return { status: 'NOT PLACED', alive: true };
    return { status: placed.hits >= placed.size ? 'SUNK' : 'ALIVE', alive: placed.hits < placed.size };
  };

  return (
    <div className="flex flex-col justify-between h-full bg-[#0B151C] border-2 border-[#1E2E3E] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur font-mono">
      {/* Header */}
      <div>
        <h3 className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase mb-4 flex items-center justify-between pb-3 border-b border-[#1C2C3C]">
          <span>YOUR FLEET</span>
          <span className="text-[10px] text-slate-300 font-bold">TACTICAL STATUS</span>
        </h3>

        {/* Fleet List */}
        <div className="space-y-3">
          {FLEET_SHIPS.map((type) => {
            const size = SHIP_SIZES[type];
            const { status, alive } = getShipStatus(type);
            const isSunk = status === 'SUNK';

            return (
              <div key={type} className="flex flex-col space-y-1.5 p-2.5 rounded-xl bg-[#081017] border border-[#1C2C3C]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 tracking-wider uppercase">{type}</span>
                    <span className="text-[10px] text-slate-400">({size})</span>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${
                    isSunk ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSunk ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`}></span>
                    {status}
                  </span>
                </div>

                {/* Segment Blocks */}
                <div className="flex space-x-1">
                  {Array.from({ length: size }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-5 flex-1 rounded-sm border transition-all ${
                        isSunk
                          ? 'bg-red-950/80 border-red-500 text-red-500'
                          : 'bg-[#064E3B] border border-[#10B981] shadow-sm shadow-emerald-500/20'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Objective Card & Surrender Actions */}
      <div className="mt-6 space-y-3">
        {/* Objective Card */}
        <div className="p-3.5 rounded-xl bg-[#081017] border border-[#1C2C3C] text-xs">
          <div className="flex items-center space-x-2 font-mono text-emerald-400 font-bold mb-1">
            <Target className="w-4 h-4" />
            <span className="uppercase tracking-wider">OBJECTIVE</span>
          </div>
          <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
            Be the first to sink all of your opponent's ships. Plan your shots. Track their moves. Win the battle.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onSurrender}
            className="flex-1 py-2.5 bg-[#081017] hover:bg-red-950/60 text-slate-300 hover:text-red-400 text-xs font-mono font-bold rounded-xl border border-[#1C2C3C] hover:border-red-500/80 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>SURRENDER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
