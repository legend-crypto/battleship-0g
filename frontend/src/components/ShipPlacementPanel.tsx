import React from 'react';
import { FLEET_SHIPS, Orientation, SHIP_SIZES, ShipType } from '@battleship/shared';
import { RotateCw, Shuffle, Trash2, Play, CheckCircle2 } from 'lucide-react';

interface ShipPlacementPanelProps {
  selectedShipType: ShipType | null;
  onSelectShipType: (shipType: ShipType) => void;
  orientation: Orientation;
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
  const isFleetComplete = placedShipTypes.length === FLEET_SHIPS.length;

  return (
    <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between w-full max-w-sm">
      <div>
        <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
          <span>Fleet Deployment</span>
          <span className="text-xs text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            {placedShipTypes.length} / {FLEET_SHIPS.length} Deployed
          </span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Select a ship and click coordinates on your ocean grid, or auto-deploy your fleet.
        </p>

        {/* Orientation Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onToggleOrientation}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Orientation: <strong className="text-cyan-300 uppercase">{orientation}</strong></span>
          </button>
        </div>

        {/* Fleet List */}
        <div className="space-y-2 mb-6">
          {FLEET_SHIPS.map((shipType) => {
            const isPlaced = placedShipTypes.includes(shipType);
            const isSelected = selectedShipType === shipType;
            const size = SHIP_SIZES[shipType];

            return (
              <button
                key={shipType}
                disabled={isPlaced}
                onClick={() => onSelectShipType(shipType)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition ${
                  isPlaced
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPlaced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  )}
                  <span className="font-semibold text-sm">{shipType}</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-400">Size {size}</span>
                  <div className="flex gap-1 ml-1">
                    {Array.from({ length: size }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-sm ${
                          isPlaced ? 'bg-slate-700' : isSelected ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAutoPlace}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto Deploy</span>
          </button>

          <button
            onClick={onReset}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Reset Grid</span>
          </button>
        </div>

        <button
          disabled={!isFleetComplete}
          onClick={onStartGame}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
            isFleetComplete
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Commence Battle</span>
        </button>
      </div>
    </div>
  );
};
