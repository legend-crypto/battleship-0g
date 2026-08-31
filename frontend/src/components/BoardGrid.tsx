import React from 'react';
import { BOARD_SIZE, CellStatus, Position, ShipPlacement } from '@battleship/shared';

interface BoardGridProps {
  title: string;
  subtitle?: string;
  grid: CellStatus[][];
  ships?: ShipPlacement[];
  isEnemyView?: boolean;
  revealShips?: boolean;
  interactive?: boolean;
  onCellClick?: (pos: Position) => void;
  hoverPos?: Position | null;
  hoverShipLength?: number;
  hoverOrientation?: 'horizontal' | 'vertical';
  isValidHover?: boolean;
  onCellHover?: (pos: Position | null) => void;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  title,
  subtitle,
  grid,
  ships = [],
  isEnemyView = false,
  revealShips = false,
  interactive = false,
  onCellClick,
  hoverPos,
  hoverShipLength,
  hoverOrientation = 'horizontal',
  isValidHover,
  onCellHover,
  actionButtonLabel,
  onActionButtonClick
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
    <div className="flex flex-col items-center w-full">
      {/* Title Header */}
      <div className="mb-3 text-center">
        <h3 className="text-xs sm:text-sm font-mono font-black tracking-widest text-[#F8FAFC] uppercase flex items-center justify-center gap-2">
          {title}
        </h3>
        {subtitle && <p className="text-[10px] font-mono text-[#64748B] tracking-wider uppercase mt-0.5">{subtitle}</p>}
      </div>

      {/* Grid Container */}
      <div className="w-full max-w-[500px]">
        {/* Top Column Headers A-J (Aligned with the 10 grid columns) */}
        <div className="flex items-center w-full mb-1">
          <div className="w-6 sm:w-7 flex-shrink-0"></div>
          <div className="grid grid-cols-10 gap-[1px] flex-1 text-center font-mono text-xs sm:text-sm font-bold text-[#64748B] select-none">
            {colLabels.map((label) => (
              <div key={label} className="py-0.5">{label}</div>
            ))}
          </div>
        </div>

        {/* 10 Rows Grid Box */}
        <div className="w-full bg-[#060D12] p-1 rounded-xl border border-[#1C2C3C] shadow-2xl backdrop-blur">
          <div className="grid grid-rows-10 gap-[1px] w-full aspect-square">
            {grid.map((row, y) => (
              <div key={y} className="flex items-center w-full h-full gap-[1px]">
                {/* Row Number 1-10 (Perfectly aligned with row Y) */}
                <div className="w-6 sm:w-7 flex-shrink-0 flex items-center justify-center font-mono text-xs sm:text-sm font-bold text-[#64748B] select-none">
                  {y + 1}
                </div>

                {/* 10 Cell Buttons for row Y */}
                <div className="grid grid-cols-10 gap-[1px] flex-1 h-full">
                  {row.map((cell, x) => {
                    const isHovered = isHoveredCell(x, y);
                    const isShipCell = cell === CellStatus.SHIP;
                    const isHit = cell === CellStatus.HIT;
                    const isMiss = cell === CellStatus.MISS;

                    {/* Exact cell styling matching reference image */}
                    let cellStyle = 'bg-[#081017] border border-[#162533] hover:border-emerald-500/80';

                    if (isEnemyView) {
                      if (isHit) {
                        cellStyle = 'bg-red-950/70 border border-red-500/80 text-red-500 font-mono font-black';
                      } else if (isMiss) {
                        cellStyle = 'bg-[#081017] border border-[#162533] text-cyan-400 font-mono font-bold';
                      } else if (revealShips && isShipCell) {
                        cellStyle = 'bg-amber-950/90 border border-amber-500 text-amber-300 shadow';
                      } else if (interactive) {
                        cellStyle = 'bg-[#081017] hover:bg-emerald-950/50 border border-[#162533] hover:border-emerald-400/80 cursor-pointer';
                      }
                    } else {
                      if (isHit) {
                        cellStyle = 'bg-red-950/70 border border-red-500/80 text-red-500 font-mono font-black';
                      } else if (isMiss) {
                        cellStyle = 'bg-[#081017] border border-[#162533] text-cyan-400 font-mono font-bold';
                      } else if (isShipCell) {
                        cellStyle = 'bg-[#0C4432] border border-[#10B981]/90 text-emerald-300 shadow-sm';
                      }
                    }

                    if (isHovered) {
                      cellStyle = isValidHover
                        ? 'bg-emerald-500/40 border border-emerald-400 ring-1 ring-emerald-400/60'
                        : 'bg-red-500/40 border border-red-400 ring-1 ring-red-400/60';
                    }

                    return (
                      <button
                        key={`${x}-${y}`}
                        disabled={!interactive || isHit || isMiss}
                        onClick={() => onCellClick && onCellClick({ x, y })}
                        onMouseEnter={() => onCellHover && onCellHover({ x, y })}
                        onMouseLeave={() => onCellHover && onCellHover(null)}
                        className={`aspect-square w-full rounded-[2px] text-xs sm:text-sm font-mono font-bold flex items-center justify-center transition-all duration-150 relative select-none ${cellStyle}`}
                      >
                        {/* HIT symbol: Red X */}
                        {isHit && <span className="text-red-500 font-bold text-sm sm:text-base">✕</span>}

                        {/* MISS symbol: Cyan O Circle (Slightly larger font size) */}
                        {isMiss && <span className="text-[#38BDF8] font-black text-sm sm:text-base leading-none">○</span>}
                        
                        {/* Revealed opponent ship block */}
                        {isEnemyView && revealShips && isShipCell && !isHit && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-amber-400"></div>
                        )}

                        {/* Player own ship block */}
                        {!isEnemyView && isShipCell && !isHit && (
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-[#10B981] shadow-sm"></div>
                        )}

                        {/* Central intersection dot on empty unshot cells */}
                        {!isHit && !isMiss && !isShipCell && !isHovered && (
                          <div className="w-1 h-1 rounded-full bg-[#1E3448]"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Below Grid */}
        {actionButtonLabel && (
          <div className="mt-4 text-center">
            <button
              onClick={onActionButtonClick}
              disabled={!interactive}
              className={`w-full py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition border ${
                interactive
                  ? 'bg-[#0C4432] hover:bg-emerald-500 hover:text-slate-950 border-[#10B981] text-emerald-300 shadow-lg shadow-emerald-500/20 cursor-pointer'
                  : 'bg-[#060D12] border-[#1C2C3C] text-[#64748B] cursor-not-allowed'
              }`}
            >
              {actionButtonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
