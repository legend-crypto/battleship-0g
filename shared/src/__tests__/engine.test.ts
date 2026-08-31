import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEmptyBoard,
  isValidPlacement,
  placeShip,
  processShot,
  isFleetSunk,
  generateRandomBoard,
  serializeBoard,
  deserializeBoard
} from '../engine.js';
import { BoardState, ShipType, ShotResultType } from '../types.js';

describe('Battleship Engine', () => {
  let board: BoardState;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe('1. Placement Validation', () => {
    it('should allow valid horizontal and vertical ship placement', () => {
      expect(isValidPlacement(board, ShipType.CARRIER, { x: 0, y: 0 }, 'horizontal')).toBe(true);
      expect(isValidPlacement(board, ShipType.DESTROYER, { x: 5, y: 5 }, 'vertical')).toBe(true);
    });

    it('should reject ship placement out of board boundaries', () => {
      // Carrier length 5 placed at x=7 horizontal extends to x=11 -> Invalid
      expect(isValidPlacement(board, ShipType.CARRIER, { x: 7, y: 0 }, 'horizontal')).toBe(false);
      // Battleship length 4 placed at y=8 vertical extends to y=11 -> Invalid
      expect(isValidPlacement(board, ShipType.BATTLESHIP, { x: 0, y: 8 }, 'vertical')).toBe(false);
    });

    it('should reject ship placement overlapping an existing ship', () => {
      const placedBoard = placeShip(board, ShipType.DESTROYER, { x: 2, y: 2 }, 'horizontal'); // occupies (2,2) and (3,2)
      expect(isValidPlacement(placedBoard, ShipType.SUBMARINE, { x: 3, y: 1 }, 'vertical')).toBe(false); // overlaps (3,2)
    });

    it('should reject placing duplicate ship type in fleet', () => {
      const placedBoard = placeShip(board, ShipType.DESTROYER, { x: 0, y: 0 }, 'horizontal');
      expect(isValidPlacement(placedBoard, ShipType.DESTROYER, { x: 5, y: 5 }, 'vertical')).toBe(false);
    });
  });

  describe('2. Shot Resolution: Hit / Miss Logic', () => {
    beforeEach(() => {
      // Place a Destroyer (length 2) at (3,4) horizontal -> (3,4) and (4,4)
      board = placeShip(board, ShipType.DESTROYER, { x: 3, y: 4 }, 'horizontal');
    });

    it('should return MISS for an empty cell', () => {
      const { updatedBoard, result } = processShot(board, { x: 0, y: 0 });
      expect(result.type).toBe(ShotResultType.MISS);
      expect(result.hit).toBe(false);
      expect(updatedBoard.grid[0][0]).toBe('miss');
    });

    it('should return HIT when firing at a ship cell', () => {
      const { updatedBoard, result } = processShot(board, { x: 3, y: 4 });
      expect(result.type).toBe(ShotResultType.HIT);
      expect(result.hit).toBe(true);
      expect(updatedBoard.grid[4][3]).toBe('hit');
    });
  });

  describe('3. Repeated Shot Rejection', () => {
    it('should reject repeated shots at the same cell', () => {
      const { updatedBoard: b1 } = processShot(board, { x: 2, y: 2 });
      const { result: r2 } = processShot(b1, { x: 2, y: 2 });
      expect(r2.type).toBe(ShotResultType.ALREADY_FIRED);
      expect(r2.message).toContain('already been targeted');
    });
  });

  describe('4. Sinking Ships and Win Condition', () => {
    it('should sink ship when all occupied cells are hit', () => {
      board = placeShip(board, ShipType.DESTROYER, { x: 0, y: 0 }, 'horizontal'); // (0,0) and (1,0)
      
      const { updatedBoard: b1, result: r1 } = processShot(board, { x: 0, y: 0 });
      expect(r1.type).toBe(ShotResultType.HIT);
      expect(r1.sunkShipType).toBeUndefined();

      const { updatedBoard: b2, result: r2 } = processShot(b1, { x: 1, y: 0 });
      expect(r2.type).toBe(ShotResultType.SUNK);
      expect(r2.sunkShipType).toBe(ShipType.DESTROYER);
    });

    it('should detect win condition when all fleet ships are sunk', () => {
      const fullBoard = generateRandomBoard();
      let currentBoard = fullBoard;

      expect(isFleetSunk(currentBoard)).toBe(false);

      // Fire at every occupied cell in the fleet
      for (const ship of fullBoard.ships) {
        for (const cell of ship.occupiedCells) {
          const { updatedBoard } = processShot(currentBoard, cell);
          currentBoard = updatedBoard;
        }
      }

      expect(isFleetSunk(currentBoard)).toBe(true);
    });
  });

  describe('5. Serialization & Random Board Generation', () => {
    it('should generate a valid board with all 5 fleet ships', () => {
      const randomBoard = generateRandomBoard();
      expect(randomBoard.ships.length).toBe(5);
      expect(isFleetSunk(randomBoard)).toBe(false);
    });

    it('should correctly serialize and deserialize board state', () => {
      const original = generateRandomBoard();
      const json = serializeBoard(original);
      const restored = deserializeBoard(json);
      expect(restored.ships).toEqual(original.ships);
      expect(restored.grid).toEqual(original.grid);
    });
  });
});
