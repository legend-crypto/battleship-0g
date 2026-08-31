export const BOARD_SIZE = 10;

export enum ShipType {
  CARRIER = 'Carrier',
  BATTLESHIP = 'Battleship',
  CRUISER = 'Cruiser',
  SUBMARINE = 'Submarine',
  DESTROYER = 'Destroyer'
}

export const FLEET_SHIPS: ShipType[] = [
  ShipType.CARRIER,
  ShipType.BATTLESHIP,
  ShipType.CRUISER,
  ShipType.SUBMARINE,
  ShipType.DESTROYER
];

export const SHIP_SIZES: Record<ShipType, number> = {
  [ShipType.CARRIER]: 5,
  [ShipType.BATTLESHIP]: 4,
  [ShipType.CRUISER]: 3,
  [ShipType.SUBMARINE]: 3,
  [ShipType.DESTROYER]: 2
};

export type Orientation = 'horizontal' | 'vertical';

export interface Position {
  x: number; // 0 to 9
  y: number; // 0 to 9
}

export enum CellStatus {
  EMPTY = 'empty',
  SHIP = 'ship',
  HIT = 'hit',
  MISS = 'miss'
}

export interface ShipPlacement {
  type: ShipType;
  bow: Position;
  orientation: Orientation;
  length: number;
  hits: number;
  sunk: boolean;
  occupiedCells: Position[];
}

export interface BoardState {
  grid: CellStatus[][];
  ships: ShipPlacement[];
  shotsReceived: Position[];
}

export enum ShotResultType {
  MISS = 'MISS',
  HIT = 'HIT',
  SUNK = 'SUNK',
  ALREADY_FIRED = 'ALREADY_FIRED',
  INVALID_COORDINATES = 'INVALID_COORDINATES'
}

export interface ShotResult {
  type: ShotResultType;
  pos: Position;
  hit: boolean;
  sunkShipType?: ShipType;
  gameOver: boolean;
  winnerId?: string;
  message?: string;
}

export enum GameMode {
  LOCAL_AI = 'LOCAL_AI',
  MULTIPLAYER = 'MULTIPLAYER'
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  STAKING = 'STAKING',
  PLACEMENT = 'PLACEMENT',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface PlayerInfo {
  id: string;
  socketId: string;
  token: string;
  name: string;
  address?: string;
  isReady: boolean;
  hasStaked: boolean;
  connected: boolean;
}

export interface MatchState {
  matchId: string;
  matchCode: string;
  matchIdBytes32: string;
  stakeAmountEth: string;
  phase: GamePhase;
  players: {
    player1: PlayerInfo;
    player2?: PlayerInfo;
  };
  currentTurn: string; // player id
  winnerId?: string;
  winnerAddress?: string;
  payoutSignature?: string;
  createdAt: number;
}

export enum SocketEvent {
  LIST_MATCHES = 'match:list',
  CREATE_MATCH = 'match:create',
  JOIN_MATCH = 'match:join',
  REGISTER_WALLET = 'match:register_wallet',
  STAKE_CONFIRMED = 'staking:confirmed',
  SUBMIT_PLACEMENT = 'game:place_ships',
  FIRE_SHOT = 'game:fire_shot',
  RECONNECT = 'match:reconnect',

  MATCH_LIST_UPDATED = 'match:list_updated',
  MATCH_CREATED = 'match:created',
  PLAYER_JOINED = 'match:player_joined',
  STAKING_READY = 'staking:ready',
  STAKING_COMPLETED = 'staking:completed',
  PLAYER_READY = 'game:player_ready',
  GAME_START = 'game:start',
  SHOT_RESOLVED = 'game:shot_resolved',
  PLAYER_DISCONNECTED = 'match:player_disconnected',
  PLAYER_RECONNECTED = 'match:player_reconnected',
  RECONNECT_SUCCESS = 'match:reconnect_success',
  GAME_OVER = 'game:over',
  ERROR = 'error'
}

// Socket Payload Interfaces
export interface CreateMatchPayload {
  playerName: string;
  stakeAmountEth?: string;
  playerAddress?: string;
}

export interface JoinMatchPayload {
  matchCode: string;
  playerName: string;
  playerAddress?: string;
}

export interface StakeConfirmedPayload {
  matchId: string;
  playerToken: string;
  txHash: string;
}

export interface SubmitPlacementPayload {
  matchId: string;
  playerToken: string;
  ships: ShipPlacement[];
}

export interface FireShotPayload {
  matchId: string;
  playerToken: string;
  pos: Position;
}

export interface ReconnectPayload {
  matchId: string;
  playerToken: string;
}

export interface MatchSummary {
  matchId: string;
  matchCode: string;
  hostName: string;
  stakeAmountEth: string;
  status: string;
  createdAt: number;
}
