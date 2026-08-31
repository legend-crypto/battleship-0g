import React from 'react';
import { FLEET_SHIPS, SHIP_SIZES, ShipType } from '@battleship/shared';
import { RotateCw, Shuffle, RotateCcw, Play, Check } from 'lucide-react';

interface ShipPlacementPanelProps {
  selectedShipType: ShipType | null;
  onSelectShipType: (shipType: ShipType) => void;
  orientation: 'horizontal' | 'vertical';
  onToggleOrientation: () => void;
  onAutoPlace: () => void;
  onReset: () => void;
  onStartGame: () => void;
  placedShipTypes: ShipType[];
}

export const ShipPlacementPanel: React.FC<ShipPlacementPanelProps> = ({
  selectedShipType,
  onSelectShipType,
  orientation,
  onToggleOrientation,
  onAutoPlace,
  onReset,
  onStartGame,
  placedShipTypes
}) => {
  const isAllPlaced = placedShipTypes.length === FLEET_SHIPS.length;

  return (
    <div className="bg-[#091015] border border-slate-800 p-5 rounded-2xl shadow-2xl backdrop-blur font-mono text-left w-full max-w-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h4 className="text-xs font-black tracking-widest text-emerald-400 uppercase">
          SELECT SHIP TO PLACE
        </h4>
        <span className="text-[10px] text-slate-500 font-bold">
          {placedShipTypes.length}/5 DEPLOYED
        </span>
      </div>

      {/* Ships Selection List */}
      <div className="space-y-2">
        {FLEET_SHIPS.map((type) => {
          const isPlaced = placedShipTypes.includes(type);
          const isSelected = selectedShipType === type;
          const size = SHIP_SIZES[type];

          return (
            <button
              key={type}
              disabled={isPlaced}
              onClick={() => onSelectShipType(type)}
              className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                isPlaced
                  ? 'bg-[#050B0E]/60 border-slate-900 text-slate-600 cursor-not-allowed'
                  : isSelected
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/40'
                  : 'bg-[#050B0E] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isPlaced ? 'bg-slate-700' : isSelected ? 'bg-emerald-400' : 'bg-slate-500'
                }`}></div>
                <div>
                  <span className="font-bold text-xs uppercase block">{type}</span>
                  <span className="text-[10px] text-slate-500">{size} Grid Cells</span>
                </div>
              </div>

              {isPlaced ? (
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> DEPLOYED
                </span>
              ) : (
                <div className="flex space-x-1">
                  {Array.from({ length: size }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-sm ${
                        isSelected ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Control Actions */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleOrientation}
            className="py-2.5 px-3 bg-[#050B0E] hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase">{orientation}</span>
          </button>

          <button
            onClick={onAutoPlace}
            className="py-2.5 px-3 bg-[#050B0E] hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
            <span>AUTO SHUFFLE</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full py-2 bg-[#050B0E] hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-bold rounded-xl border border-slate-800 hover:border-red-900/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET PLACEMENT</span>
        </button>

        <button
          disabled={!isAllPlaced}
          onClick={onStartGame}
          className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 ${
            isAllPlaced
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer'
              : 'bg-[#050B0E] border border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>LOCK FLEET & START BATTLE</span>
        </button>
      </div>
    </div>
  );
};
