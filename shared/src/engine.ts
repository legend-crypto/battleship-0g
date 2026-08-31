import {
  BOARD_SIZE,
  BoardState,
  CellStatus,
  FLEET_SHIPS,
  Orientation,
  Position,
  SHIP_SIZES,
  ShipPlacement,
  ShipType,
  ShotResult,
  ShotResultType
} from './types.js';

/**
 * Creates a fresh, empty 10x10 Battleship board state.
 */
export function createEmptyBoard(): BoardState {
  const grid: CellStatus[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => CellStatus.EMPTY)
  );

  return {
    grid,
    ships: [],
    shotsReceived: []
  };
}

/**
 * Calculates occupied coordinates for a ship based on bow position, length, and orientation.
 */
export function getShipCells(bow: Position, length: number, orientation: Orientation): Position[] {
  const cells: Position[] = [];
  for (let i = 0; i < length; i++) {
    if (orientation === 'horizontal') {
      cells.push({ x: bow.x + i, y: bow.y });
    } else {
      cells.push({ x: bow.x, y: bow.y + i });
    }
  }
  return cells;
}

/**
 * Validates whether a position is within the 10x10 board boundaries.
 */
export function isWithinBounds(pos: Position): boolean {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
}

/**
 * Checks if a ship placement is valid (within bounds, no overlap, ship type not already placed).
 */
export function isValidPlacement(
  board: BoardState,
  shipType: ShipType,
  bow: Position,
  orientation: Orientation
): boolean {
  const length = SHIP_SIZES[shipType];
  const cells = getShipCells(bow, length, orientation);

  // Check if ship type was already placed
  if (board.ships.some((s) => s.type === shipType)) {
    return false;
  }

  // Check bounds and cell overlaps
  for (const cell of cells) {
    if (!isWithinBounds(cell)) {
      return false;
    }
    if (board.grid[cell.y][cell.x] !== CellStatus.EMPTY) {
      return false;
    }
  }

  return true;
}

/**
 * Places a ship onto a board (pure function, returns new immutable board state).
 */
export function placeShip(
  board: BoardState,
  shipType: ShipType,
  bow: Position,
  orientation: Orientation
): BoardState {
  if (!isValidPlacement(board, shipType, bow, orientation)) {
    throw new Error(`Invalid placement for ${shipType} at (${bow.x}, ${bow.y}) [${orientation}]`);
  }

  const length = SHIP_SIZES[shipType];
  const occupiedCells = getShipCells(bow, length, orientation);

  // Clone grid matrix
  const newGrid = board.grid.map((row) => [...row]);
  for (const cell of occupiedCells) {
    newGrid[cell.y][cell.x] = CellStatus.SHIP;
  }

  const newShip: ShipPlacement = {
    type: shipType,
    bow,
    orientation,
    length,
    hits: 0,
    sunk: false,
    occupiedCells
  };

  return {
    ...board,
    grid: newGrid,
    ships: [...board.ships, newShip]
  };
}

/**
 * Automatically places all 5 standard fleet ships at valid random locations.
 */
export function generateRandomBoard(): BoardState {
  let board = createEmptyBoard();
  const orientations: Orientation[] = ['horizontal', 'vertical'];

  for (const shipType of FLEET_SHIPS) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      attempts++;
      const orientation = orientations[Math.floor(Math.random() * orientations.length)];
      const bow: Position = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };

      if (isValidPlacement(board, shipType, bow, orientation)) {
        board = placeShip(board, shipType, bow, orientation);
        placed = true;
      }
    }

    if (!placed) {
      // Fallback restart if random generation deadlocks
      return generateRandomBoard();
    }
  }

  return board;
}

/**
 * Processes a shot directed at the specified coordinate.
 * Returns the updated board and a detailed ShotResult.
 */
export function processShot(
  board: BoardState,
  pos: Position
): { updatedBoard: BoardState; result: ShotResult } {
  if (!isWithinBounds(pos)) {
    return {
      updatedBoard: board,
      result: {
        type: ShotResultType.INVALID_COORDINATES,
        pos,
        hit: false,
        gameOver: false,
        message: 'Shot coordinate is out of bounds.'
      }
    };
  }

  const currentCell = board.grid[pos.y][pos.x];

  if (currentCell === CellStatus.HIT || currentCell === CellStatus.MISS) {
    return {
      updatedBoard: board,
      result: {
        type: ShotResultType.ALREADY_FIRED,
        pos,
        hit: false,
        gameOver: false,
        message: 'Coordinate has already been targeted.'
      }
    };
  }

  const newGrid = board.grid.map((row) => [...row]);
  const newShots = [...board.shotsReceived, pos];

  if (currentCell === CellStatus.EMPTY) {
    newGrid[pos.y][pos.x] = CellStatus.MISS;
    const updatedBoard: BoardState = {
      ...board,
      grid: newGrid,
      shotsReceived: newShots
    };

    return {
      updatedBoard,
      result: {
        type: ShotResultType.MISS,
        pos,
        hit: false,
        gameOver: false
      }
    };
  }

  // CellStatus.SHIP - Hit recorded!
  newGrid[pos.y][pos.x] = CellStatus.HIT;

  let hitShipType: ShipType | undefined;
  let shipJustSunk = false;

  const newShips = board.ships.map((ship) => {
    const isOccupied = ship.occupiedCells.some((cell) => cell.x === pos.x && cell.y === pos.y);
    if (isOccupied) {
      hitShipType = ship.type;
      const newHits = ship.hits + 1;
      const isSunk = newHits >= ship.length;
      if (isSunk && !ship.sunk) {
        shipJustSunk = true;
      }
      return {
        ...ship,
        hits: newHits,
        sunk: isSunk
      };
    }
    return ship;
  });

  const updatedBoard: BoardState = {
    grid: newGrid,
    ships: newShips,
    shotsReceived: newShots
  };

  const gameOver = isFleetSunk(updatedBoard);

  return {
    updatedBoard,
    result: {
      type: shipJustSunk ? ShotResultType.SUNK : ShotResultType.HIT,
      pos,
      hit: true,
      sunkShipType: shipJustSunk ? hitShipType : undefined,
      gameOver
    }
  };
}

/**
 * Determines whether all ships in a fleet have been sunk.
 */
export function isFleetSunk(board: BoardState): boolean {
  if (board.ships.length < FLEET_SHIPS.length) {
    return false;
  }
  return board.ships.every((ship) => ship.sunk);
}

/**
 * Serializes board state into plain JSON.
 */
export function serializeBoard(board: BoardState): string {
  return JSON.stringify(board);
}

/**
 * Deserializes JSON string back to BoardState object.
 */
export function deserializeBoard(json: string): BoardState {
  return JSON.parse(json) as BoardState;
}
