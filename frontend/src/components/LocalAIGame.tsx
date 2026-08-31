import React, { useState, useEffect } from 'react';
import {
  BOARD_SIZE,
  BoardState,
  CellStatus,
  FLEET_SHIPS,
  Orientation,
  Position,
  SHIP_SIZES,
  ShipType,
  ShotResultType,
  createEmptyBoard,
  createInitialAIState,
  generateRandomBoard,
  getNextAIMove,
  isFleetSunk,
  isValidPlacement,
  placeShip,
  processShot,
  updateAIState
} from '@battleship/shared';
import { BoardGrid } from './BoardGrid';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { GameLog, LogEntry } from './GameLog';
import { Trophy, ArrowLeft, RefreshCw, Bot, ShieldCheck, Flame } from 'lucide-react';

interface LocalAIGameProps {
  onBackToMenu: () => void;
}

export const LocalAIGame: React.FC<LocalAIGameProps> = ({ onBackToMenu }) => {
  const [phase, setPhase] = useState<'PLACEMENT' | 'PLAYING' | 'FINISHED'>('PLACEMENT');
  
  // Boards
  const [playerBoard, setPlayerBoard] = useState<BoardState>(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState<BoardState>(createEmptyBoard());
  
  // Tracking Grids (Publicly visible cell status)
  const [aiOceanTracking, setAiOceanTracking] = useState<CellStatus[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY))
  );
  const [playerOceanTracking, setPlayerOceanTracking] = useState<CellStatus[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY))
  );

  // AI & Turn State
  const [aiState, setAiState] = useState(createInitialAIState());
  const [currentTurn, setCurrentTurn] = useState<'PLAYER' | 'AI'>('PLAYER');
  const [winner, setWinner] = useState<'PLAYER' | 'AI' | null>(null);

  // Placement controls
  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(FLEET_SHIPS[0]);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  // Logs & Stats
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [playerShots, setPlayerShots] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [aiShots, setAiShots] = useState(0);
  const [aiHits, setAiHits] = useState(0);

  const placedShipTypes = playerBoard.ships.map((s) => s.type);

  const addLog = (sender: 'PLAYER' | 'AI', message: string, type: 'hit' | 'miss' | 'sunk' | 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, sender, message, timestamp, type },
      ...prev
    ]);
  };

  // Select next unplaced ship automatically
  const selectNextAvailableShip = (board: BoardState) => {
    const remaining = FLEET_SHIPS.filter((s) => !board.ships.some((p) => p.type === s));
    setSelectedShipType(remaining.length > 0 ? remaining[0] : null);
  };

  const handleCellPlacementClick = (pos: Position) => {
    if (phase !== 'PLACEMENT' || !selectedShipType) return;

    if (isValidPlacement(playerBoard, selectedShipType, pos, orientation)) {
      const updated = placeShip(playerBoard, selectedShipType, pos, orientation);
      setPlayerBoard(updated);
      selectNextAvailableShip(updated);
    }
  };

  const handleAutoPlace = () => {
    const randomBoard = generateRandomBoard();
    setPlayerBoard(randomBoard);
    setSelectedShipType(null);
  };

  const handleResetPlacement = () => {
    setPlayerBoard(createEmptyBoard());
    setSelectedShipType(FLEET_SHIPS[0]);
  };

  const handleStartBattle = () => {
    if (placedShipTypes.length !== FLEET_SHIPS.length) return;

    const randomAiBoard = generateRandomBoard();
    setAiBoard(randomAiBoard);
    setPhase('PLAYING');
    setCurrentTurn('PLAYER');
    addLog('PLAYER', 'Battle initiated! All tactical grids online.', 'info');
  };

  // Player Fire Shot Handler
  const handleFireShot = (pos: Position) => {
    if (phase !== 'PLAYING' || currentTurn !== 'PLAYER') return;
    if (aiOceanTracking[pos.y][pos.x] !== CellStatus.EMPTY) return;

    const colLabel = String.fromCharCode(65 + pos.x);
    const coordStr = `${colLabel}${pos.y + 1}`;

    const { updatedBoard, result } = processShot(aiBoard, pos);
    setAiBoard(updatedBoard);

    // Update Player's Tracking Grid for AI's board
    const newTracking = aiOceanTracking.map((row) => [...row]);
    newTracking[pos.y][pos.x] = result.hit ? CellStatus.HIT : CellStatus.MISS;
    setAiOceanTracking(newTracking);

    setPlayerShots((prev) => prev + 1);

    if (result.hit) {
      setPlayerHits((prev) => prev + 1);
      if (result.type === ShotResultType.SUNK) {
        addLog('PLAYER', `DIRECT HIT at ${coordStr}! Enemy ${result.sunkShipType} SUNK!`, 'sunk');
      } else {
        addLog('PLAYER', `HIT reported at ${coordStr}!`, 'hit');
      }
    } else {
      addLog('PLAYER', `Splash at ${coordStr}. Miss.`, 'miss');
    }

    if (result.gameOver) {
      setWinner('PLAYER');
      setPhase('FINISHED');
      addLog('PLAYER', 'VICTORY! All enemy naval vessels destroyed!', 'sunk');
    } else {
      setCurrentTurn('AI');
    }
  };

  // AI Turn Logic Effect
  useEffect(() => {
    if (phase !== 'PLAYING' || currentTurn !== 'AI') return;

    const aiTimeout = setTimeout(() => {
      try {
        const { pos, nextState } = getNextAIMove(playerOceanTracking, aiState);
        const colLabel = String.fromCharCode(65 + pos.x);
        const coordStr = `${colLabel}${pos.y + 1}`;

        const { updatedBoard, result } = processShot(playerBoard, pos);
        setPlayerBoard(updatedBoard);

        // Update AI's Tracking Grid for Player's board
        const newTracking = playerOceanTracking.map((row) => [...row]);
        newTracking[pos.y][pos.x] = result.hit ? CellStatus.HIT : CellStatus.MISS;
        setPlayerOceanTracking(newTracking);

        const isSunk = result.type === ShotResultType.SUNK;
        const updatedAiState = updateAIState(nextState, pos, result.hit, isSunk, newTracking);
        setAiState(updatedAiState);

        setAiShots((prev) => prev + 1);

        if (result.hit) {
          setAiHits((prev) => prev + 1);
          if (isSunk) {
            addLog('AI', `AI struck ${coordStr}! Your ${result.sunkShipType} was SUNK!`, 'sunk');
          } else {
            addLog('AI', `AI hit your fleet at ${coordStr}!`, 'hit');
          }
        } else {
          addLog('AI', `AI fired at ${coordStr} and missed.`, 'miss');
        }

        if (result.gameOver) {
          setWinner('AI');
          setPhase('FINISHED');
          addLog('AI', 'DEFEAT! Your fleet has been completely destroyed.', 'sunk');
        } else {
          setCurrentTurn('PLAYER');
        }
      } catch (err) {
        console.error('AI Move Error:', err);
        setCurrentTurn('PLAYER');
      }
    }, 600);

    return () => clearTimeout(aiTimeout);
  }, [phase, currentTurn, playerBoard, playerOceanTracking, aiState]);

  const handleRestart = () => {
    setPlayerBoard(createEmptyBoard());
    setAiBoard(createEmptyBoard());
    setAiOceanTracking(Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)));
    setPlayerOceanTracking(Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)));
    setAiState(createInitialAIState());
    setCurrentTurn('PLAYER');
    setWinner(null);
    setSelectedShipType(FLEET_SHIPS[0]);
    setLogs([]);
    setPlayerShots(0);
    setPlayerHits(0);
    setAiShots(0);
    setAiHits(0);
    setPhase('PLACEMENT');
  };

  const isValidHover =
    hoverPos && selectedShipType
      ? isValidPlacement(playerBoard, selectedShipType, hoverPos, orientation)
      : false;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
      {/* Top Controller Bar */}
      <div className="w-full flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="flex items-center space-x-3">
          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold">
              {currentTurn === 'PLAYER' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Select target coordinate</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-indigo-400">AI THINKING...</span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleRestart}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Main View Area */}
      {phase === 'PLACEMENT' ? (
        <div className="grid lg:grid-cols-3 gap-8 w-full items-start">
          <div className="lg:col-span-2 flex justify-center">
            <BoardGrid
              title="Deploy Your Fleet"
              subtitle="Hover over cells to position ships"
              grid={playerBoard.grid}
              ships={playerBoard.ships}
              interactive={true}
              onCellClick={handleCellPlacementClick}
              hoverPos={hoverPos}
              hoverShipLength={selectedShipType ? SHIP_SIZES[selectedShipType] : undefined}
              hoverOrientation={orientation}
              isValidHover={isValidHover}
              onCellHover={setHoverPos}
            />
          </div>

          <div className="flex justify-center">
            <ShipPlacementPanel
              selectedShipType={selectedShipType}
              onSelectShipType={setSelectedShipType}
              orientation={orientation}
              onToggleOrientation={() =>
                setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
              }
              onAutoPlace={handleAutoPlace}
              onReset={handleResetPlacement}
              onStartGame={handleStartBattle}
              placedShipTypes={placedShipTypes}
            />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 w-full items-start">
          {/* Left Grid: Enemy Tracking Grid */}
          <div className="flex justify-center">
            <BoardGrid
              title="Targeting Radar (Enemy Ocean)"
              subtitle={currentTurn === 'PLAYER' ? 'Click to fire missile' : 'Awaiting AI move'}
              grid={aiOceanTracking}
              isEnemyView={true}
              interactive={currentTurn === 'PLAYER'}
              onCellClick={handleFireShot}
            />
          </div>

          {/* Right Grid: Player Ocean */}
          <div className="flex justify-center">
            <BoardGrid
              title="Your Ocean Grid"
              subtitle="Defend your fleet"
              grid={playerBoard.grid}
              ships={playerBoard.ships}
              isEnemyView={false}
              interactive={false}
            />
          </div>

          {/* Game Log & Status Column */}
          <div className="flex justify-center h-full">
            <GameLog
              logs={logs}
              playerShots={playerShots}
              playerHits={playerHits}
              aiShots={aiShots}
              aiHits={aiHits}
            />
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {phase === 'FINISHED' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-cyan-950/50">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
              {winner === 'PLAYER' ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Flame className="w-10 h-10 text-red-500" />
              )}
            </div>

            <h3 className="text-2xl font-black mb-2 text-white">
              {winner === 'PLAYER' ? 'NAVAL VICTORY!' : 'FLEET DESTROYED!'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {winner === 'PLAYER'
                ? 'You successfully sunk the entire enemy fleet with tactical precision!'
                : 'The AI tactical system overwhelmed your naval defenses.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500">Your Accuracy</div>
                <div className="text-cyan-300 font-bold text-sm">
                  {playerShots > 0 ? Math.round((playerHits / playerShots) * 100) : 0}% ({playerHits}/{playerShots})
                </div>
              </div>
              <div>
                <div className="text-slate-500">AI Accuracy</div>
                <div className="text-indigo-300 font-bold text-sm">
                  {aiShots > 0 ? Math.round((aiHits / aiShots) * 100) : 0}% ({aiHits}/{aiShots})
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                Play Again
              </button>
              <button
                onClick={onBackToMenu}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition border border-slate-700"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
