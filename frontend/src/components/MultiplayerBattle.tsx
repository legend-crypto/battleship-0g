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
  SocketEvent,
  createEmptyBoard,
  isValidPlacement,
  placeShip,
  generateRandomBoard
} from '@battleship/shared';
import { socketService } from '../services/socket';
import { StakingPanel } from './StakingPanel';
import { BoardGrid } from './BoardGrid';
import { FleetPanel } from './FleetPanel';
import { MatchInfoPanel } from './MatchInfoPanel';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BATTLESHIP_STAKING_ADDRESS, BATTLESHIP_STAKING_ABI } from '../config/contract';
import { ZERO_G_GALILEO_TESTNET } from '../config/wagmi';
import { ArrowLeft, RefreshCw, Trophy, Flame, Shield, Coins, ExternalLink, CheckCircle2, Eye, BarChart3, Info, BookOpen, MessageSquare, Settings, Target } from 'lucide-react';

interface MultiplayerBattleProps {
  matchData: {
    matchId: string;
    matchCode: string;
    matchIdBytes32: string;
    stakeAmountEth: string;
    playerToken: string;
    playerId: string;
    role: 'host' | 'guest';
    player1Name: string;
    player2Name?: string;
  };
  onExit: () => void;
}

export const MultiplayerBattle: React.FC<MultiplayerBattleProps> = ({ matchData, onExit }) => {
  const { address } = useAccount();
  const [phase, setPhase] = useState<'STAKING' | 'PLACEMENT' | 'PLAYING' | 'FINISHED'>('STAKING');
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Staking state
  const [hasStaked, setHasStaked] = useState(false);
  const [stakeTxHash, setStakeTxHash] = useState<string | undefined>();

  // Winner Claim State
  const [payoutTxHash, setPayoutTxHash] = useState<`0x${string}` | undefined>();
  const [payoutSignature, setPayoutSignature] = useState<string | undefined>();
  const [winnerAddress, setWinnerAddress] = useState<string | undefined>();
  const [totalPayoutEth, setTotalPayoutEth] = useState<string>('0.2');

  // Boards & Grids
  const [myBoard, setMyBoard] = useState<BoardState>(createEmptyBoard());
  const [opponentBoard, setOpponentBoard] = useState<BoardState | null>(null);
  const [enemyOceanTracking, setEnemyOceanTracking] = useState<CellStatus[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY))
  );

  // Turn & Connection State
  const [currentTurn, setCurrentTurn] = useState<string>('');
  const [isMyReady, setIsMyReady] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Placement controls
  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(FLEET_SHIPS[0]);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  // Logs & Stats
  const [logs, setLogs] = useState<any[]>([]);
  const [myShots, setMyShots] = useState(0);
  const [myHits, setMyHits] = useState(0);
  const [oppShots, setOppShots] = useState(0);
  const [oppHits, setOppHits] = useState(0);

  const socket = socketService.getSocket();
  const placedShipTypes = myBoard.ships.map((s) => s.type);
  const isMyTurn = currentTurn === matchData.playerId;

  const { writeContractAsync, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimMining, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: payoutTxHash
  });

  const addLog = (sender: 'PLAYER' | 'AI', message: string, type: 'hit' | 'miss' | 'sunk' | 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, sender, message, timestamp, type },
      ...prev
    ]);
  };

  useEffect(() => {
    localStorage.setItem(`token_${matchData.matchId}`, matchData.playerToken);
    localStorage.setItem(`pid_${matchData.matchId}`, matchData.playerId);

    if (address) {
      socket.emit(SocketEvent.REGISTER_WALLET, {
        matchId: matchData.matchId,
        playerToken: matchData.playerToken,
        walletAddress: address
      });
    }

    socket.on(SocketEvent.STAKING_COMPLETED, () => {
      setPhase('PLACEMENT');
      addLog('PLAYER', '0G Escrow deposits confirmed! Deploy your fleet.', 'info');
    });

    socket.on(SocketEvent.PLAYER_READY, (data: { p1Ready: boolean; p2Ready: boolean }) => {
      const myReadyState = matchData.role === 'host' ? data.p1Ready : data.p2Ready;
      setIsMyReady(myReadyState);
    });

    socket.on(SocketEvent.GAME_START, (data: { matchId: string; currentTurn: string }) => {
      setPhase('PLAYING');
      setCurrentTurn(data.currentTurn);
      addLog('PLAYER', 'Game started! Alternate turns to target enemy ocean.', 'info');
    });

    socket.on(SocketEvent.SHOT_RESOLVED, (data: { shooterId: string; pos: Position; hit: boolean; sunkShipType?: ShipType; currentTurn: string; gameOver: boolean; winnerId?: string }) => {
      setCurrentTurn(data.currentTurn);
      const colLabel = String.fromCharCode(65 + data.pos.x);
      const coordStr = `${colLabel}${data.pos.y + 1}`;
      const isMeShooter = data.shooterId === matchData.playerId;

      if (isMeShooter) {
        setMyShots((prev) => prev + 1);
        const newTracking = enemyOceanTracking.map((row) => [...row]);
        newTracking[data.pos.y][data.pos.x] = data.hit ? CellStatus.HIT : CellStatus.MISS;
        setEnemyOceanTracking(newTracking);

        if (data.hit) {
          setMyHits((prev) => prev + 1);
          if (data.sunkShipType) {
            addLog('PLAYER', `You fired at ${coordStr} — SUNK ${data.sunkShipType}!`, 'sunk');
          } else {
            addLog('PLAYER', `You fired at ${coordStr} — HIT`, 'hit');
          }
        } else {
          addLog('PLAYER', `You fired at ${coordStr} — MISS`, 'miss');
        }
      } else {
        setOppShots((prev) => prev + 1);
        setMyBoard((prevBoard) => {
          const newGrid = prevBoard.grid.map((row) => [...row]);
          newGrid[data.pos.y][data.pos.x] = data.hit ? CellStatus.HIT : CellStatus.MISS;
          return { ...prevBoard, grid: newGrid };
        });

        if (data.hit) {
          setOppHits((prev) => prev + 1);
          if (data.sunkShipType) {
            addLog('AI', `Opponent fired at ${coordStr} — SUNK ${data.sunkShipType}!`, 'sunk');
          } else {
            addLog('AI', `Opponent fired at ${coordStr} — HIT`, 'hit');
          }
        } else {
          addLog('AI', `Opponent fired at ${coordStr} — MISS`, 'miss');
        }
      }
    });

    socket.on(SocketEvent.PLAYER_DISCONNECTED, (data: { message: string }) => {
      setOpponentConnected(false);
      addLog('AI', data.message, 'info');
    });

    socket.on(SocketEvent.PLAYER_RECONNECTED, (data: { playerName: string }) => {
      setOpponentConnected(true);
      addLog('PLAYER', `${data.playerName} reconnected to match.`, 'info');
    });

    socket.on(SocketEvent.GAME_OVER, (data: {
      winnerId: string;
      winnerAddress?: string;
      payoutSignature?: string;
      totalPayoutEth?: string;
      player1Board: BoardState;
      player2Board: BoardState;
    }) => {
      setPhase('FINISHED');
      setWinnerId(data.winnerId);
      setWinnerAddress(data.winnerAddress);
      setPayoutSignature(data.payoutSignature);
      if (data.totalPayoutEth) setTotalPayoutEth(data.totalPayoutEth);

      const oppBoard = matchData.role === 'host' ? data.player2Board : data.player1Board;
      setOpponentBoard(oppBoard);

      setShowStatsModal(true);

      const didIWin = data.winnerId === matchData.playerId;
      addLog('PLAYER', didIWin ? 'VICTORY! All enemy ships destroyed! Opponent fleet revealed.' : 'DEFEAT! Your fleet was sunk.', 'sunk');
    });

    return () => {
      socket.off(SocketEvent.STAKING_COMPLETED);
      socket.off(SocketEvent.PLAYER_READY);
      socket.off(SocketEvent.GAME_START);
      socket.off(SocketEvent.SHOT_RESOLVED);
      socket.off(SocketEvent.PLAYER_DISCONNECTED);
      socket.off(SocketEvent.PLAYER_RECONNECTED);
      socket.off(SocketEvent.GAME_OVER);
    };
  }, [socket, matchData, enemyOceanTracking, address]);

  const handleStakeConfirmed = (txHash: string) => {
    setHasStaked(true);
    setStakeTxHash(txHash);
    socket.emit(SocketEvent.STAKE_CONFIRMED, {
      matchId: matchData.matchId,
      playerToken: matchData.playerToken,
      txHash
    });
  };

  const handleClaimPayout = async () => {
    if (!payoutSignature || !matchData.matchIdBytes32) return;
    try {
      const hash = await writeContractAsync({
        address: BATTLESHIP_STAKING_ADDRESS,
        abi: BATTLESHIP_STAKING_ABI,
        functionName: 'claimWinnerPayout',
        args: [matchData.matchIdBytes32 as `0x${string}`, payoutSignature as `0x${string}`]
      });
      setPayoutTxHash(hash);
    } catch (err: any) {
      console.error('Claim Error:', err);
    }
  };

  const selectNextAvailableShip = (board: BoardState) => {
    const remaining = FLEET_SHIPS.filter((s) => !board.ships.some((p) => p.type === s));
    setSelectedShipType(remaining.length > 0 ? remaining[0] : null);
  };

  const handleCellPlacementClick = (pos: Position) => {
    if (phase !== 'PLACEMENT' || !selectedShipType || isMyReady) return;

    if (isValidPlacement(myBoard, selectedShipType, pos, orientation)) {
      const updated = placeShip(myBoard, selectedShipType, pos, orientation);
      setMyBoard(updated);
      selectNextAvailableShip(updated);
    }
  };

  const handleAutoPlace = () => {
    if (isMyReady) return;
    const randomBoard = generateRandomBoard();
    setMyBoard(randomBoard);
    setSelectedShipType(null);
  };

  const handleResetPlacement = () => {
    if (isMyReady) return;
    setMyBoard(createEmptyBoard());
    setSelectedShipType(FLEET_SHIPS[0]);
  };

  const handleSubmitPlacement = () => {
    if (placedShipTypes.length !== FLEET_SHIPS.length) return;

    socket.emit(SocketEvent.SUBMIT_PLACEMENT, {
      matchId: matchData.matchId,
      playerToken: matchData.playerToken,
      ships: myBoard.ships
    });
  };

  const handleFireShot = (pos: Position) => {
    if (phase !== 'PLAYING' || !isMyTurn) return;
    if (enemyOceanTracking[pos.y][pos.x] !== CellStatus.EMPTY) return;

    socket.emit(SocketEvent.FIRE_SHOT, {
      matchId: matchData.matchId,
      playerToken: matchData.playerToken,
      pos
    });
  };

  const isValidHover =
    hoverPos && selectedShipType
      ? isValidPlacement(myBoard, selectedShipType, hoverPos, orientation)
      : false;

  const isWinner = winnerId === matchData.playerId;
  const myAccuracy = myShots > 0 ? Math.round((myHits / myShots) * 100) : 0;
  const oppAccuracy = oppShots > 0 ? Math.round((oppHits / oppShots) * 100) : 0;

  const myShipsAlive = FLEET_SHIPS.length - myBoard.ships.filter((s) => s.hits >= s.size).length;
  const oppShipsAlive = opponentBoard ? FLEET_SHIPS.length - opponentBoard.ships.filter((s) => s.hits >= s.size).length : 5;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-80px)] w-full max-w-[1850px] mx-auto px-4 lg:px-8 py-4 space-y-5">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between bg-[#091015] p-3.5 rounded-xl border border-slate-800 font-mono text-xs shadow-xl">
        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT LOBBY</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-emerald-400 bg-[#050B0E] px-3 py-1 rounded-lg border border-slate-800 font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            STAKE: {matchData.stakeAmountEth} 0G
          </span>

          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#050B0E] border border-slate-800 text-[11px] font-bold">
              {isMyTurn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Target opponent grid</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-400">OPPONENT'S TURN...</span>
                </>
              )}
            </div>
          )}

          {phase === 'FINISHED' && (
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                isWinner
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  : 'bg-red-950 border border-red-500 text-red-400'
              }`}>
                {isWinner ? <Trophy className="w-4 h-4 text-amber-400" /> : <Flame className="w-4 h-4 text-red-400" />}
                <span>WINNER: {isWinner ? 'YOU (VICTORY!)' : 'OPPONENT'}</span>
              </span>

              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Accuracy & Claim</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {phase === 'STAKING' ? (
        <div className="flex flex-col items-center justify-center py-8 w-full">
          <StakingPanel
            matchIdBytes32={matchData.matchIdBytes32}
            stakeAmountEth={matchData.stakeAmountEth}
            role={matchData.role}
            hasStaked={hasStaked}
            onStakeConfirmed={handleStakeConfirmed}
          />
        </div>
      ) : phase === 'PLACEMENT' ? (
        <div className="grid lg:grid-cols-12 gap-6 w-full items-start">
          <div className="lg:col-span-8 flex justify-center">
            <BoardGrid
              title="YOUR WATERS"
              subtitle={isMyReady ? 'FLEET LOCKED — Awaiting opponent readiness...' : 'DEFEND YOUR FLEET — Hover to position ships'}
              grid={myBoard.grid}
              ships={myBoard.ships}
              interactive={!isMyReady}
              onCellClick={handleCellPlacementClick}
              hoverPos={hoverPos}
              hoverShipLength={selectedShipType ? SHIP_SIZES[selectedShipType] : undefined}
              hoverOrientation={orientation}
              isValidHover={isValidHover}
              onCellHover={setHoverPos}
              actionButtonLabel="PLACE / MOVE FLEET"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col items-center gap-4">
            <ShipPlacementPanel
              selectedShipType={selectedShipType}
              onSelectShipType={setSelectedShipType}
              orientation={orientation}
              onToggleOrientation={() =>
                setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
              }
              onAutoPlace={handleAutoPlace}
              onReset={handleResetPlacement}
              onStartGame={handleSubmitPlacement}
              placedShipTypes={placedShipTypes}
            />

            {isMyReady && (
              <div className="w-full bg-[#091015] p-4 rounded-xl border border-emerald-500/40 text-center font-mono text-xs text-emerald-400 font-bold">
                ✓ FLEET LOCKED & READY FOR ENGAGEMENT
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Widescreen Responsive Console View with Central Radar Target Divider (⊕) */
        <div className="grid grid-cols-12 gap-6 w-full items-stretch flex-1">
          {/* Left Panel: YOUR FLEET (3 cols) */}
          <div className="col-span-12 lg:col-span-3">
            <FleetPanel ships={myBoard.ships} onSurrender={onExit} />
          </div>

          {/* Middle Section: DUAL BOARDS + CENTRAL RADAR DIVIDER (6 cols) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center justify-items-center w-full">
              {/* YOUR WATERS */}
              <div className="w-full max-w-[480px]">
                <BoardGrid
                  title="YOUR WATERS"
                  subtitle="DEFEND YOUR FLEET"
                  grid={myBoard.grid}
                  ships={myBoard.ships}
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
                      : isMyTurn
                      ? 'SELECT A TARGET COORDINATE'
                      : 'AWAITING OPPONENT MOVE'
                  }
                  grid={phase === 'FINISHED' && opponentBoard ? opponentBoard.grid : enemyOceanTracking}
                  ships={opponentBoard?.ships || []}
                  isEnemyView={true}
                  revealShips={phase === 'FINISHED'}
                  interactive={isMyTurn && phase === 'PLAYING'}
                  onCellClick={handleFireShot}
                  actionButtonLabel={
                    phase === 'FINISHED'
                      ? 'MATCH ENDED'
                      : isMyTurn
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
              opponentAddress={matchData.player2Name || 'OPPONENT'}
              opponentName={matchData.player2Name || 'PLAYER 02'}
              isMyTurn={isMyTurn}
              playerShipsLeft={myShipsAlive}
              opponentShipsLeft={oppShipsAlive}
              stakeAmountEth={matchData.stakeAmountEth}
              turnCount={myShots + oppShots}
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
      {showStatsModal && phase === 'FINISHED' && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-[#091015] border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Inspect Grid"
            >
              <Eye className="w-5 h-5 text-emerald-400" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              {isWinner ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Flame className="w-10 h-10 text-red-500" />
              )}
            </div>

            {/* Prominent Winner Declaration */}
            <div className="mb-4">
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-2 ${
                isWinner
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                MATCH WINNER: {isWinner ? 'YOU (VICTORY!)' : 'OPPONENT'}
              </span>

              <h3 className="text-2xl font-black text-white">
                {isWinner ? 'MULTIPLAYER VICTORY!' : 'MATCH DEFEAT!'}
              </h3>
            </div>

            {/* Winner Payout Claim Box */}
            {isWinner && payoutSignature && (
              <div className="mb-6 p-4 bg-[#050B0E] rounded-2xl border border-emerald-500/30 text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Escrow Pool:</span>
                  <span className="text-emerald-400 font-bold text-sm">{totalPayoutEth} 0G</span>
                </div>

                {isClaimSuccess && payoutTxHash ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>0G Stake Payout Claimed!</span>
                    </div>
                    <a
                      href={`${ZERO_G_GALILEO_TESTNET.blockExplorers.default.url}/tx/${payoutTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1"
                    >
                      <span>View Claim Tx on 0G Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <button
                    disabled={isClaimPending || isClaimMining}
                    onClick={handleClaimPayout}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>
                      {isClaimPending
                        ? 'Confirming in Wallet...'
                        : isClaimMining
                        ? 'Mining Claim Tx...'
                        : `Claim ${totalPayoutEth} 0G Pooled Stake`}
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatsModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>INSPECT GRID</span>
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition uppercase cursor-pointer"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
