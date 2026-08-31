import { describe, it, expect } from 'vitest';
import { createInitialAIState, getNextAIMove, updateAIState } from '../ai.js';
import { createEmptyBoard, placeShip, processShot } from '../engine.js';
import { CellStatus, ShipType } from '../types.js';

describe('Hunt & Target AI', () => {
  it('should generate a valid move in HUNT mode within 10x10 grid', () => {
    const board = createEmptyBoard();
    const state = createInitialAIState();
    const { pos, nextState } = getNextAIMove(board.grid, state);

    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThan(10);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThan(10);
    expect(nextState.mode).toBe('HUNT');
  });

  it('should switch to TARGET mode after hitting a ship and target adjacent cells', () => {
    let board = createEmptyBoard();
    board = placeShip(board, ShipType.DESTROYER, { x: 4, y: 4 }, 'horizontal'); // (4,4) & (5,4)

    const hitPos = { x: 4, y: 4 };
    const { updatedBoard, result } = processShot(board, hitPos);

    const initialState = createInitialAIState();
    const targetState = updateAIState(initialState, hitPos, true, false, updatedBoard.grid);

    expect(targetState.mode).toBe('TARGET');
    expect(targetState.targetQueue.length).toBeGreaterThan(0);

    // AI should target one of the adjacent cells (e.g. (4,3), (4,5), (5,4), (3,4))
    const { pos: nextAiPos } = getNextAIMove(updatedBoard.grid, targetState);
    const isAdjacent = Math.abs(nextAiPos.x - 4) + Math.abs(nextAiPos.y - 4) === 1;
    expect(isAdjacent).toBe(true);
  });

  it('should return to HUNT mode when a ship is sunk', () => {
    let board = createEmptyBoard();
    board = placeShip(board, ShipType.DESTROYER, { x: 1, y: 1 }, 'horizontal');

    const state1 = createInitialAIState();
    const state2 = updateAIState(state1, { x: 1, y: 1 }, true, false, board.grid);
    expect(state2.mode).toBe('TARGET');

    const state3 = updateAIState(state2, { x: 2, y: 1 }, true, true, board.grid); // Sunk!
    expect(state3.mode).toBe('HUNT');
    expect(state3.targetQueue.length).toBe(0);
  });
});
