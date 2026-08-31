import React from 'react';
import { BOARD_SIZE, CellStatus, Position, ShipPlacement } from '@battleship/shared';
import { Target, Flame, Waves } from 'lucide-react';

interface BoardGridProps {
  title: string;
  subtitle?: string;
  grid: CellStatus[][];
  ships?: ShipPlacement[];
  isEnemyView?: boolean;
  interactive?: boolean;
  onCellClick?: (pos: Position) => void;
  hoverPos?: Position | null;
  hoverShipLength?: number;
  hoverOrientation?: 'horizontal' | 'vertical';
  isValidHover?: boolean;
  onCellHover?: (pos: Position | null) => void;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  title,
  subtitle,
  grid,
  ships = [],
  isEnemyView = false,
  interactive = false,
  onCellClick,
  hoverPos,
  hoverShipLength,
  hoverOrientation = 'horizontal',
  isValidHover,
  onCellHover
}) => {
  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  // Calculate hover preview cells during placement
  const hoverCells: Position[] = [];
  if (hoverPos && hoverShipLength) {
    for (let i = 0; i < hoverShipLength; i++) {
      if (hoverOrientation === 'horizontal') {
        hoverCells.push({ x: hoverPos.x + i, y: hoverPos.y });
      } else {
        hoverCells.push({ x: hoverPos.x, y: hoverPos.y + i });
      }
    }
  }

  const isHoveredCell = (x: number, y: number) => {
    return hoverCells.some((c) => c.x === x && c.y === y);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 text-center">
        <h3 className="text-lg font-bold tracking-wide text-cyan-300 flex items-center justify-center gap-2">
          {isEnemyView ? <Target className="w-5 h-5 text-red-400" /> : <Waves className="w-5 h-5 text-cyan-400" />}
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        {/* Column Headers (A-J) */}
        <div className="grid grid-cols-11 gap-1 mb-1 text-center font-mono text-xs font-semibold text-slate-500">
          <div className="w-8 h-8 flex items-center justify-center"></div>
          {colLabels.map((label) => (
            <div key={label} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              {label}
            </div>
          ))}
        </div>

        {/* 10x10 Grid Rows */}
        {grid.map((row, y) => (
          <div key={y} className="grid grid-cols-11 gap-1">
            {/* Row Number (1-10) */}
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-mono text-xs font-semibold text-slate-500">
              {y + 1}
            </div>

            {row.map((cell, x) => {
              const isHovered = isHoveredCell(x, y);
              const isShipCell = cell === CellStatus.SHIP;
              const isHit = cell === CellStatus.HIT;
              const isMiss = cell === CellStatus.MISS;

              let cellStyle = 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700';

              if (isEnemyView) {
                if (isHit) cellStyle = 'bg-red-950/90 border-red-500 text-red-400 animate-pulse shadow-inner shadow-red-500/50';
                else if (isMiss) cellStyle = 'bg-cyan-950/50 border-cyan-800/50 text-cyan-400/60';
                else if (interactive) cellStyle = 'bg-slate-950 hover:bg-cyan-950/40 border-slate-800 hover:border-cyan-500/60 cursor-pointer';
              } else {
                if (isHit) cellStyle = 'bg-red-950/90 border-red-500 text-red-400 animate-pulse';
                else if (isMiss) cellStyle = 'bg-cyan-950/50 border-cyan-800/50 text-cyan-400/60';
                else if (isShipCell) cellStyle = 'bg-cyan-950 border-cyan-500/80 text-cyan-300 shadow-md shadow-cyan-500/20';
              }

              if (isHovered) {
                cellStyle = isValidHover
                  ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400/50'
                  : 'bg-red-500/30 border-red-400 ring-2 ring-red-400/50';
              }

              return (
                <button
                  key={`${x}-${y}`}
                  disabled={!interactive || isHit || isMiss}
                  onClick={() => onCellClick && onCellClick({ x, y })}
                  onMouseEnter={() => onCellHover && onCellHover({ x, y })}
                  onMouseLeave={() => onCellHover && onCellHover(null)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border text-sm font-bold flex items-center justify-center transition-all duration-150 relative group ${cellStyle}`}
                >
                  {isHit && <Flame className="w-5 h-5 text-red-500 animate-bounce" />}
                  {isMiss && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70"></div>}
                  {!isEnemyView && isShipCell && !isHit && (
                    <div className="w-3 h-3 rounded-sm bg-cyan-400 shadow-sm shadow-cyan-300"></div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
