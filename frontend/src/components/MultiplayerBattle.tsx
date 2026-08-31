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
import { WalletConnect } from './WalletConnect';
import { BoardGrid } from './BoardGrid';
import { ShipPlacementPanel } from './ShipPlacementPanel';
import { GameLog, LogEntry } from './GameLog';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BATTLESHIP_STAKING_ADDRESS, BATTLESHIP_STAKING_ABI } from '../config/contract';
import { ZERO_G_GALILEO_TESTNET } from '../config/wagmi';
import { ArrowLeft, RefreshCw, Trophy, Flame, Shield, Coins, ExternalLink, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
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

    // Register wallet address with backend session
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
            addLog('PLAYER', `HIT at ${coordStr}! Enemy ${data.sunkShipType} SUNK!`, 'sunk');
          } else {
            addLog('PLAYER', `HIT reported at ${coordStr}!`, 'hit');
          }
        } else {
          addLog('PLAYER', `Splash at ${coordStr}. Miss.`, 'miss');
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
            addLog('AI', `Opponent struck ${coordStr}! Your ${data.sunkShipType} was SUNK!`, 'sunk');
          } else {
            addLog('AI', `Opponent hit your fleet at ${coordStr}!`, 'hit');
          }
        } else {
          addLog('AI', `Opponent fired at ${coordStr} and missed.`, 'miss');
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

      const didIWin = data.winnerId === matchData.playerId;
      addLog('PLAYER', didIWin ? 'VICTORY! All enemy ships destroyed! Claim your stake payout below.' : 'DEFEAT! Your fleet was sunk.', 'sunk');
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

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Lobby</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-cyan-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
            STAKE: {matchData.stakeAmountEth} 0G
          </span>

          {phase === 'PLAYING' && (
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold">
              {isMyTurn ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400">YOUR TURN — Target opponent grid</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-400">OPPONENT'S TURN...</span>
                </>
              )}
            </div>
          )}
        </div>

        <WalletConnect />
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
        <div className="grid lg:grid-cols-3 gap-8 w-full items-start">
          <div className="lg:col-span-2 flex justify-center">
            <BoardGrid
              title="Deploy Fleet"
              subtitle={isMyReady ? 'Fleet locked. Awaiting opponent fleet readiness...' : 'Position all 5 fleet vessels'}
              grid={myBoard.grid}
              ships={myBoard.ships}
              interactive={!isMyReady}
              onCellClick={handleCellPlacementClick}
              hoverPos={hoverPos}
              hoverShipLength={selectedShipType ? SHIP_SIZES[selectedShipType] : undefined}
              hoverOrientation={orientation}
              isValidHover={isValidHover}
              onCellHover={setHoverPos}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
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
              <div className="w-full bg-slate-900/90 p-4 rounded-2xl border border-cyan-500/30 text-center font-mono text-xs text-cyan-300">
                ✓ Fleet Locked & Ready!
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 w-full items-start">
          {/* Enemy Ocean Radar */}
          <div className="flex justify-center">
            <BoardGrid
              title="Enemy Ocean Radar"
              subtitle={isMyTurn ? 'Fire missile target' : 'Awaiting opponent move'}
              grid={enemyOceanTracking}
              isEnemyView={true}
              interactive={isMyTurn}
              onCellClick={handleFireShot}
            />
          </div>

          {/* Player Fleet Grid */}
          <div className="flex justify-center">
            <BoardGrid
              title="Your Ocean Grid"
              subtitle="Defend your position"
              grid={phase === 'FINISHED' && opponentBoard ? opponentBoard.grid : myBoard.grid}
              ships={myBoard.ships}
              isEnemyView={false}
              interactive={false}
            />
          </div>

          {/* Combat Feed Log */}
          <div className="flex justify-center h-full">
            <GameLog
              logs={logs}
              playerShots={myShots}
              playerHits={myHits}
              aiShots={oppShots}
              aiHits={oppHits}
            />
          </div>
        </div>
      )}

      {/* Game Over Modal with Winner Payout Claim */}
      {phase === 'FINISHED' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-indigo-950/50">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              {isWinner ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Flame className="w-10 h-10 text-red-500" />
              )}
            </div>

            <h3 className="text-2xl font-black mb-2 text-white">
              {isWinner ? 'MULTIPLAYER VICTORY!' : 'MATCH DEFEAT!'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {isWinner
                ? `You won the battle! Claim the pooled 0G token escrow stake of ${totalPayoutEth} 0G.`
                : 'Your opponent succeeded in sinking all of your fleet vessels.'}
            </p>

            {/* Winner Payout Claim Box */}
            {isWinner && payoutSignature && (
              <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Escrow Pool:</span>
                  <span className="text-cyan-300 font-bold text-sm">{totalPayoutEth} 0G</span>
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
                      className="text-[10px] text-cyan-400 underline font-mono flex items-center gap-1"
                    >
                      <span>View Claim Tx on 0G Explorer</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <button
                    disabled={isClaimPending || isClaimMining}
                    onClick={handleClaimPayout}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
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

            <button
              onClick={onExit}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition border border-slate-700"
            >
              Return to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
