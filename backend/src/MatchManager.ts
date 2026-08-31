import {
  BOARD_SIZE,
  BoardState,
  CellStatus,
  FLEET_SHIPS,
  GamePhase,
  Position,
  SHIP_SIZES,
  ShipPlacement,
  ShipType,
  ShotResultType,
  createEmptyBoard,
  isFleetSunk,
  isValidPlacement,
  placeShip,
  processShot
} from '@battleship/shared';
import crypto from 'crypto';
import { ethers } from 'ethers';

export interface ServerPlayer {
  id: string;
  socketId: string;
  token: string;
  name: string;
  address?: string;
  board: BoardState;
  trackingGrid: CellStatus[][];
  isReady: boolean;
  hasStaked: boolean;
  connected: boolean;
}

export interface ServerMatchSession {
  matchId: string;
  matchCode: string;
  matchIdBytes32: string;
  stakeAmountEth: string;
  phase: GamePhase;
  player1: ServerPlayer;
  player2?: ServerPlayer;
  currentTurn: string; // player id
  winnerId?: string;
  winnerAddress?: string;
  payoutSignature?: string;
  createdAt: number;
  disconnectTimeout?: NodeJS.Timeout;
}

export class MatchManager {
  private matches: Map<string, ServerMatchSession> = new Map();
  private codeToMatchId: Map<string, string> = new Map();
  private arbiterWallet: ethers.Wallet;

  constructor() {
    // Default testing key for local/testnet arbiter signing
    const arbiterKey = process.env.ARBITER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';
    this.arbiterWallet = new ethers.Wallet(arbiterKey);
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createMatch(
    socketId: string,
    playerName: string,
    stakeAmountEth: string = '0.1',
    playerAddress?: string
  ): { matchId: string; matchCode: string; matchIdBytes32: string; playerToken: string; player1Id: string } {
    const matchId = `match_${crypto.randomBytes(8).toString('hex')}`;
    const matchIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(matchId));

    let matchCode = this.generateCode();
    while (this.codeToMatchId.has(matchCode)) {
      matchCode = this.generateCode();
    }

    const player1Id = `p1_${crypto.randomBytes(4).toString('hex')}`;
    const playerToken = crypto.randomBytes(16).toString('hex');

    const player1: ServerPlayer = {
      id: player1Id,
      socketId,
      token: playerToken,
      name: playerName || 'Player 1',
      address: playerAddress,
      board: createEmptyBoard(),
      trackingGrid: Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)),
      isReady: false,
      hasStaked: false,
      connected: true
    };

    const session: ServerMatchSession = {
      matchId,
      matchCode,
      matchIdBytes32,
      stakeAmountEth: stakeAmountEth || '0.1',
      phase: GamePhase.LOBBY,
      player1,
      currentTurn: player1Id,
      createdAt: Date.now()
    };

    this.matches.set(matchId, session);
    this.codeToMatchId.set(matchCode, matchId);

    return { matchId, matchCode, matchIdBytes32, playerToken, player1Id };
  }

  public joinMatch(
    socketId: string,
    matchCode: string,
    playerName: string,
    playerAddress?: string
  ): { session: ServerMatchSession; playerToken: string; player2Id: string } {
    const cleanCode = matchCode.trim().toUpperCase();
    const matchId = this.codeToMatchId.get(cleanCode);

    if (!matchId || !this.matches.has(matchId)) {
      throw new Error('Match code not found or expired.');
    }

    const session = this.matches.get(matchId)!;

    if (session.player2) {
      throw new Error('Match is already full.');
    }

    const player2Id = `p2_${crypto.randomBytes(4).toString('hex')}`;
    const playerToken = crypto.randomBytes(16).toString('hex');

    const player2: ServerPlayer = {
      id: player2Id,
      socketId,
      token: playerToken,
      name: playerName || 'Player 2',
      address: playerAddress,
      board: createEmptyBoard(),
      trackingGrid: Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)),
      isReady: false,
      hasStaked: false,
      connected: true
    };

    session.player2 = player2;
    session.phase = GamePhase.STAKING;

    return { session, playerToken, player2Id };
  }

  public registerWalletAddress(matchId: string, playerToken: string, walletAddress: string) {
    const session = this.matches.get(matchId);
    if (!session) return;

    if (session.player1.token === playerToken) {
      session.player1.address = walletAddress;
    } else if (session.player2?.token === playerToken) {
      session.player2.address = walletAddress;
    }
  }

  public confirmStake(matchId: string, playerToken: string): { session: ServerMatchSession; bothStaked: boolean } {
    const session = this.matches.get(matchId);
    if (!session) throw new Error('Match not found.');

    const player = session.player1.token === playerToken ? session.player1 : session.player2?.token === playerToken ? session.player2 : null;
    if (!player) throw new Error('Unauthorized player token.');

    player.hasStaked = true;

    const bothStaked = Boolean(session.player1.hasStaked && session.player2?.hasStaked);
    if (bothStaked) {
      session.phase = GamePhase.PLACEMENT;
    }

    return { session, bothStaked };
  }

  public getPublicLobbies() {
    const list = [];
    for (const session of this.matches.values()) {
      if (session.phase === GamePhase.LOBBY && !session.player2) {
        list.push({
          matchId: session.matchId,
          matchCode: session.matchCode,
          hostName: session.player1.name,
          stakeAmountEth: session.stakeAmountEth,
          status: 'Waiting for opponent',
          createdAt: session.createdAt
        });
      }
    }
    return list;
  }

  public getMatch(matchId: string): ServerMatchSession | undefined {
    return this.matches.get(matchId);
  }

  public submitPlacement(
    matchId: string,
    playerToken: string,
    ships: ShipPlacement[]
  ): { session: ServerMatchSession; bothReady: boolean } {
    const session = this.matches.get(matchId);
    if (!session) throw new Error('Match not found.');

    const player = session.player1.token === playerToken ? session.player1 : session.player2?.token === playerToken ? session.player2 : null;
    if (!player) throw new Error('Unauthorized player token.');

    if (ships.length !== FLEET_SHIPS.length) {
      throw new Error('Incomplete fleet placement. Exactly 5 ships required.');
    }

    let testBoard = createEmptyBoard();
    for (const s of ships) {
      if (!isValidPlacement(testBoard, s.type, s.bow, s.orientation)) {
        throw new Error(`Invalid ship placement for ${s.type} at (${s.bow.x}, ${s.bow.y}).`);
      }
      testBoard = placeShip(testBoard, s.type, s.bow, s.orientation);
    }

    player.board = testBoard;
    player.isReady = true;

    const bothReady = Boolean(session.player1.isReady && session.player2?.isReady);
    if (bothReady) {
      session.phase = GamePhase.PLAYING;
      session.currentTurn = Math.random() < 0.5 ? session.player1.id : session.player2!.id;
    }

    return { session, bothReady };
  }

  public async processShot(
    matchId: string,
    playerToken: string,
    pos: Position
  ): Promise<{
    session: ServerMatchSession;
    shooter: ServerPlayer;
    target: ServerPlayer;
    result: any;
    gameOver: boolean;
    payoutSignature?: string;
  }> {
    const session = this.matches.get(matchId);
    if (!session) throw new Error('Match not found.');
    if (session.phase !== GamePhase.PLAYING) throw new Error('Game is not in PLAYING phase.');

    const isP1 = session.player1.token === playerToken;
    const isP2 = session.player2?.token === playerToken;

    if (!isP1 && !isP2) throw new Error('Unauthorized player token.');

    const shooter = isP1 ? session.player1 : session.player2!;
    const target = isP1 ? session.player2! : session.player1;

    if (session.currentTurn !== shooter.id) {
      throw new Error('Not your turn.');
    }

    const { updatedBoard, result } = processShot(target.board, pos);
    if (result.type === ShotResultType.ALREADY_FIRED || result.type === ShotResultType.INVALID_COORDINATES) {
      throw new Error(result.message || 'Invalid shot target.');
    }

    target.board = updatedBoard;
    shooter.trackingGrid[pos.y][pos.x] = result.hit ? CellStatus.HIT : CellStatus.MISS;

    const gameOver = isFleetSunk(target.board);
    let payoutSignature: string | undefined;

    if (gameOver) {
      session.phase = GamePhase.FINISHED;
      session.winnerId = shooter.id;
      session.winnerAddress = shooter.address || '0x0000000000000000000000000000000000000000';

      // Generate off-chain ECDSA attestation signature for winner payout claim
      const totalPayoutWei = ethers.parseEther(session.stakeAmountEth) * 2n;
      const messageHash = ethers.solidityPackedKeccak256(
        ['string', 'bytes32', 'address', 'uint256'],
        ['WINNER_PAYOUT', session.matchIdBytes32, session.winnerAddress, totalPayoutWei]
      );

      payoutSignature = await this.arbiterWallet.signMessage(ethers.getBytes(messageHash));
      session.payoutSignature = payoutSignature;
    } else {
      session.currentTurn = target.id;
    }

    return { session, shooter, target, result, gameOver, payoutSignature };
  }

  public handleDisconnect(socketId: string): { session?: ServerMatchSession; disconnectedPlayer?: ServerPlayer; opponentSocketId?: string } {
    for (const session of this.matches.values()) {
      let player: ServerPlayer | undefined;
      let opponent: ServerPlayer | undefined;

      if (session.player1.socketId === socketId) {
        player = session.player1;
        opponent = session.player2;
      } else if (session.player2?.socketId === socketId) {
        player = session.player2;
        opponent = session.player1;
      }

      if (player) {
        player.connected = false;

        if (session.disconnectTimeout) clearTimeout(session.disconnectTimeout);
        session.disconnectTimeout = setTimeout(() => {
          if (!player!.connected && session.phase === GamePhase.PLAYING) {
            session.phase = GamePhase.FINISHED;
            if (opponent) {
              session.winnerId = opponent.id;
              session.winnerAddress = opponent.address;
            }
          }
        }, 60000);

        return { session, disconnectedPlayer: player, opponentSocketId: opponent?.socketId };
      }
    }

    return {};
  }

  public reconnect(socketId: string, matchId: string, playerToken: string): { session: ServerMatchSession; player: ServerPlayer; opponentSocketId?: string } {
    const session = this.matches.get(matchId);
    if (!session) throw new Error('Match not found.');

    let player: ServerPlayer | undefined;
    let opponent: ServerPlayer | undefined;

    if (session.player1.token === playerToken) {
      player = session.player1;
      opponent = session.player2;
    } else if (session.player2?.token === playerToken) {
      player = session.player2;
      opponent = session.player1;
    }

    if (!player) throw new Error('Invalid player token.');

    player.socketId = socketId;
    player.connected = true;

    if (session.disconnectTimeout) {
      clearTimeout(session.disconnectTimeout);
      session.disconnectTimeout = undefined;
    }

    return { session, player, opponentSocketId: opponent?.socketId };
  }
}
