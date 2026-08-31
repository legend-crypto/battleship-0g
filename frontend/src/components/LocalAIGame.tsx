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
import { FleetPanel } from './FleetPanel';
import { MatchInfoPanel } from './MatchInfoPanel';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { Trophy, ArrowLeft, RefreshCw, Bot, Flame, BarChart3, Eye, Play, BookOpen, MessageSquare, Settings, Info, Target } from 'lucide-react';
import { useAccount } from 'wagmi';

interface LocalAIGameProps {
  onBackToMenu: () => void;
}

export const LocalAIGame: React.FC<LocalAIGameProps> = ({ onBackToMenu }) => {
  const { address } = useAccount();
  const [phase, setPhase] = useState<'PLACEMENT' | 'PLAYING' | 'FINISHED'>('PLACEMENT');
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Boards
  const [playerBoard, setPlayerBoard] = useState<BoardState>(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState<BoardState>(createEmptyBoard());
  
  // Tracking Grids
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
  const [logs, setLogs] = useState<any[]>([]);
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
    setShowStatsModal(false);
    addLog('PLAYER', 'Battle initiated! All tactical grids online.', 'info');
  };

  const handleFireShot = (pos: Position) => {
    if (phase !== 'PLAYING' || currentTurn !== 'PLAYER') return;
    if (aiOceanTracking[pos.y][pos.x] !== CellStatus.EMPTY) return;

    const colLabel = String.fromCharCode(65 + pos.x);
    const coordStr = `${colLabel}${pos.y + 1}`;

    const { updatedBoard, result } = processShot(aiBoard, pos);
    setAiBoard(updatedBoard);

    const newTracking = aiOceanTracking.map((row) => [...row]);
    newTracking[pos.y][pos.x] = result.hit ? CellStatus.HIT : CellStatus.MISS;
    setAiOceanTracking(newTracking);

    setPlayerShots((prev) => prev + 1);

    if (result.hit) {
      setPlayerHits((prev) => prev + 1);
      if (result.type === ShotResultType.SUNK) {
        addLog('PLAYER', `You fired at ${coordStr} — SUNK ${result.sunkShipType}!`, 'sunk');
      } else {
        addLog('PLAYER', `You fired at ${coordStr} — HIT`, 'hit');
      }
    } else {
      addLog('PLAYER', `You fired at ${coordStr} — MISS`, 'miss');
    }

    if (result.gameOver) {
      setWinner('PLAYER');
      setPhase('FINISHED');
      setShowStatsModal(true);
      addLog('PLAYER', 'VICTORY! All enemy naval vessels destroyed!', 'sunk');
    } else {
      setCurrentTurn('AI');
    }
  };

  useEffect(() => {
    if (phase !== 'PLAYING' || currentTurn !== 'AI') return;

    const aiTimeout = setTimeout(() => {
      try {
        const { pos, nextState } = getNextAIMove(playerOceanTracking, aiState);
        const colLabel = String.fromCharCode(65 + pos.x);
        const coordStr = `${colLabel}${pos.y + 1}`;

        const { updatedBoard, result } = processShot(playerBoard, pos);
        setPlayerBoard(updatedBoard);

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
            addLog('AI', `Opponent fired at ${coordStr} — SUNK ${result.sunkShipType}!`, 'sunk');
          } else {
            addLog('AI', `Opponent fired at ${coordStr} — HIT`, 'hit');
          }
        } else {
          addLog('AI', `Opponent fired at ${coordStr} — MISS`, 'miss');
        }

        if (result.gameOver) {
          setWinner('AI');
          setPhase('FINISHED');
          setShowStatsModal(true);
          addLog('AI', 'DEFEAT! Your fleet has been destroyed.', 'sunk');
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
    setShowStatsModal(false);
  };

  const handleSurrender = () => {
    setWinner('AI');
    setPhase('FINISHED');
    setShowStatsModal(true);
    addLog('PLAYER', 'Commander surrendered the match.', 'info');
  };

  const isValidHover =
    hoverPos && selectedShipType
      ? isValidPlacement(playerBoard, selectedShipType, hoverPos, orientation)
      : false;

  const playerAccuracy = playerShots > 0 ? Math.round((playerHits / playerShots) * 100) : 0;
  const aiAccuracy = aiShots > 0 ? Math.round((aiHits / aiShots) * 100) : 0;

  const playerShipsAlive = FLEET_SHIPS.length - playerBoard.ships.filter((s) => s.hits >= s.size).length;
  const aiShipsAlive = FLEET_SHIPS.length - aiBoard.ships.filter((s) => s.hits >= s.size).length;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-80px)] w-full max-w-[1850px] mx-auto px-4 lg:px-8 py-4 space-y-5">
      {/* Top Header Navigation Bar */}
      <div className="w-full flex items-center justify-between bg-[#091015] p-3.5 rounded-xl border border-slate-800 font-mono text-xs shadow-xl">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT BATTLE STATION</span>
        </button>

        <div className="flex items-center space-x-3">
          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#050B0E] border border-slate-800 text-[11px] font-bold">
              {currentTurn === 'PLAYER' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Select target coordinate</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-indigo-400">TACTICAL AI COMPUTING...</span>
                </>
              )}
            </div>
          )}

          {phase === 'FINISHED' && (
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                winner === 'PLAYER'
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  : 'bg-red-950 border border-red-500 text-red-400'
              }`}>
                {winner === 'PLAYER' ? <Trophy className="w-4 h-4 text-amber-400" /> : <Flame className="w-4 h-4 text-red-400" />}
                <span>WINNER: {winner === 'PLAYER' ? 'COMMANDER (YOU)' : 'TACTICAL AI'}</span>
              </span>

              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Accuracy Report</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleRestart}
          className="flex items-center space-x-2 text-slate-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RESTART MATCH</span>
        </button>
      </div>

      {/* Main View Area */}
      {phase === 'PLACEMENT' ? (
        <div className="grid lg:grid-cols-12 gap-6 w-full items-start">
          <div className="lg:col-span-8 flex justify-center">
            <BoardGrid
              title="YOUR WATERS"
              subtitle="DEFEND YOUR FLEET — Hover to position ships"
              grid={playerBoard.grid}
              ships={playerBoard.ships}
              interactive={true}
              onCellClick={handleCellPlacementClick}
              hoverPos={hoverPos}
              hoverShipLength={selectedShipType ? SHIP_SIZES[selectedShipType] : undefined}
              hoverOrientation={orientation}
              isValidHover={isValidHover}
              onCellHover={setHoverPos}
              actionButtonLabel="PLACE / MOVE FLEET"
            />
          </div>

          <div className="lg:col-span-4 flex justify-center">
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
        /* Widescreen Responsive Console View with Central Radar Target Divider (⊕) */
        <div className="grid grid-cols-12 gap-6 w-full items-stretch flex-1">
          {/* Left Panel: YOUR FLEET (3 cols) */}
          <div className="col-span-12 lg:col-span-3">
            <FleetPanel ships={playerBoard.ships} onSurrender={handleSurrender} />
          </div>

          {/* Middle Section: DUAL BOARDS + CENTRAL RADAR DIVIDER (6 cols) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center justify-items-center w-full">
              {/* YOUR WATERS */}
              <div className="w-full max-w-[480px]">
                <BoardGrid
                  title="YOUR WATERS"
                  subtitle="DEFEND YOUR FLEET"
                  grid={playerBoard.grid}
                  ships={playerBoard.ships}
                  isEnemyView={false}
                  interactive={false}
                  actionButtonLabel="YOUR WATERS (DEFENSE)"
                />
              </div>

              {/* Central Target Radar Divider (⊕) matching reference image */}
              <div className="hidden md:flex flex-col items-center justify-center space-y-2 text-[#64748B]">
                <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#1C2C3C] to-transparent"></div>
                <div className="w-7 h-7 rounded-full border border-[#1C2C3C] flex items-center justify-center text-slate-500 bg-[#060D12]">
                  <Target className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
                <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#1C2C3C] to-transparent"></div>
              </div>

              {/* ENEMY WATERS */}
              <div className="w-full max-w-[480px]">
                <BoardGrid
                  title="ENEMY WATERS"
                  subtitle={
                    phase === 'FINISHED'
                      ? 'DESTROY ENEMY FLEET (REVEALED)'
                      : currentTurn === 'PLAYER'
                      ? 'SELECT A TARGET COORDINATE'
                      : 'AWAITING AI MOVE'
                  }
                  grid={phase === 'FINISHED' ? aiBoard.grid : aiOceanTracking}
                  ships={aiBoard.ships}
                  isEnemyView={true}
                  revealShips={phase === 'FINISHED'}
                  interactive={currentTurn === 'PLAYER' && phase === 'PLAYING'}
                  onCellClick={handleFireShot}
                  actionButtonLabel={
                    phase === 'FINISHED'
                      ? 'MATCH ENDED'
                      : currentTurn === 'PLAYER'
                      ? 'FIRE A SHOT'
                      : 'SELECT A TARGET COORDINATE'
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Panel: MATCH INFO & STAKE POOL & LOGS (3 cols) */}
          <div className="col-span-12 lg:col-span-3">
            <MatchInfoPanel
              playerAddress={address}
              opponentName="TACTICAL AI"
              isMyTurn={currentTurn === 'PLAYER'}
              playerShipsLeft={playerShipsAlive}
              opponentShipsLeft={aiShipsAlive}
              stakeAmountEth="0.00"
              turnCount={playerShots + aiShots}
              logs={logs}
            />
          </div>
        </div>
      )}

      {/* Bottom Console Status Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between py-3 px-5 bg-[#091015] border border-slate-800 rounded-xl font-mono text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Connected to <span className="text-emerald-400 font-bold">0G Network</span></span>
          <span className="mx-2 text-slate-600">•</span>
          <span className="text-slate-300">Good Luck, Commander.</span>
        </div>

        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <button className="hover:text-emerald-400 transition cursor-pointer" title="Documentation">
            <BookOpen className="w-4 h-4" />
          </button>
          <button className="hover:text-emerald-400 transition cursor-pointer" title="Match Chat">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="hover:text-emerald-400 transition cursor-pointer" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accuracy Stats & Winner Declaration Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Inspect Grid"
            >
              <Eye className="w-5 h-5 text-emerald-400" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              {winner === 'PLAYER' ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Flame className="w-10 h-10 text-red-500" />
              )}
            </div>

            {/* Prominent Winner Declaration */}
            <div className="mb-4">
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-2 ${
                winner === 'PLAYER'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                MATCH WINNER: {winner === 'PLAYER' ? 'COMMANDER (YOU)' : 'TACTICAL AI'}
              </span>

              <h3 className="text-2xl font-black text-white">
                {winner === 'PLAYER' ? 'NAVAL VICTORY!' : 'FLEET DESTROYED!'}
              </h3>
            </div>

            {/* Accuracy Performance Breakdown Card */}
            <div className="space-y-3 mb-6 text-xs text-left bg-[#050B0E] p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-semibold uppercase">ACCURACY REPORT</span>
                <span className="text-emerald-400 font-bold">MATCH STATS</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${winner === 'PLAYER' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                  <span className="text-slate-300">Commander (You):</span>
                </div>
                <span className="text-emerald-300 font-bold text-sm">
                  {playerAccuracy}% <span className="text-slate-500 text-xs">({playerHits}/{playerShots})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${winner === 'AI' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  <span className="text-slate-300">Tactical AI:</span>
                </div>
                <span className="text-indigo-300 font-bold text-sm">
                  {aiAccuracy}% <span className="text-slate-500 text-xs">({aiHits}/{aiShots})</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatsModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>INSPECT GRID</span>
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
