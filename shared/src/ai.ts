import { BOARD_SIZE, CellStatus, Position } from './types.js';

export type AIMode = 'HUNT' | 'TARGET';

export interface AIState {
  mode: AIMode;
  targetQueue: Position[];
  currentHitChain: Position[];
}

/**
 * DEBUG FLAG FOR AUDIT VERIFICATION
 * Set to `true` to log AI decision inputs, mode, and target selection on every turn.
 */
export const DEBUG_AI_LOGGING = false;

/**
 * Creates the initial state for the Hunt & Target AI.
 */
export function createInitialAIState(): AIState {
  return {
    mode: 'HUNT',
    targetQueue: [],
    currentHitChain: []
  };
}

/**
 * Helper to check if a position has already been fired upon (HIT or MISS).
 */
function isAlreadyTargeted(grid: CellStatus[][], pos: Position): boolean {
  if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
    return true;
  }
  const status = grid[pos.y][pos.x];
  return status === CellStatus.HIT || status === CellStatus.MISS;
}

/**
 * Returns valid orthogonal neighbor positions (North, South, East, West).
 */
function getAdjacentPositions(pos: Position): Position[] {
  return [
    { x: pos.x, y: pos.y - 1 }, // North
    { x: pos.x, y: pos.y + 1 }, // South
    { x: pos.x + 1, y: pos.y }, // East
    { x: pos.x - 1, y: pos.y }  // West
  ];
}

/**
 * Selects the next coordinate for the AI to fire at.
 */
export function getNextAIMove(
  trackingGrid: CellStatus[][],
  aiState: AIState = createInitialAIState()
): { pos: Position; nextState: AIState } {
  let state: AIState = { ...aiState };

  // Filter out any target queue items that were already targeted
  const validQueue = state.targetQueue.filter((p) => !isAlreadyTargeted(trackingGrid, p));

  if (validQueue.length > 0) {
    const nextPos = validQueue[0];
    const remainingQueue = validQueue.slice(1);
    
    if (DEBUG_AI_LOGGING) {
      console.log('[AI DEBUG] getNextAIMove Executed', {
        functionName: 'getNextAIMove',
        mode: 'TARGET',
        inputShape: {
          trackingGrid: `${trackingGrid.length}x${trackingGrid[0]?.length} (fog-of-war matrix)`,
          targetQueueLength: validQueue.length,
          currentHitChainLength: state.currentHitChain.length
        },
        selectedTarget: nextPos
      });
    }

    return {
      pos: nextPos,
      nextState: {
        ...state,
        targetQueue: remainingQueue
      }
    };
  }

  // Fallback to HUNT mode if queue is exhausted
  state = { ...state, mode: 'HUNT', targetQueue: [] };

  // Parity search (checkerboard pattern: (x + y) % 2 === 0)
  const parityCandidates: Position[] = [];
  const allCandidates: Position[] = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pos = { x, y };
      if (!isAlreadyTargeted(trackingGrid, pos)) {
        allCandidates.push(pos);
        if ((x + y) % 2 === 0) {
          parityCandidates.push(pos);
        }
      }
    }
  }

  const pool = parityCandidates.length > 0 ? parityCandidates : allCandidates;
  if (pool.length === 0) {
    throw new Error('AI has no available target cells left on grid');
  }

  const selectedPos = pool[Math.floor(Math.random() * pool.length)];

  if (DEBUG_AI_LOGGING) {
    console.log('[AI DEBUG] getNextAIMove Executed', {
      functionName: 'getNextAIMove',
      mode: 'HUNT',
      inputShape: {
        trackingGrid: `${trackingGrid.length}x${trackingGrid[0]?.length} (fog-of-war matrix)`,
        parityCandidatesCount: parityCandidates.length,
        allUnshotCandidatesCount: allCandidates.length
      },
      selectedTarget: selectedPos
    });
  }

  return {
    pos: selectedPos,
    nextState: state
  };
}

/**
 * Updates AI state based on the result of the shot (hit, miss, or sunk).
 */
export function updateAIState(
  currentState: AIState,
  shotPos: Position,
  hit: boolean,
  sunk: boolean,
  trackingGrid: CellStatus[][]
): AIState {
  if (sunk) {
    // Ship is destroyed! Reset back to HUNT mode
    return {
      mode: 'HUNT',
      targetQueue: [],
      currentHitChain: []
    };
  }

  if (!hit) {
    // Miss! Retain existing target queue filtering out already targeted positions
    const remainingQueue = currentState.targetQueue.filter(
      (p) => !isAlreadyTargeted(trackingGrid, p)
    );
    return {
      ...currentState,
      mode: remainingQueue.length > 0 ? 'TARGET' : 'HUNT',
      targetQueue: remainingQueue
    };
  }

  // Hit recorded! Switch to TARGET mode and update queue
  const newHitChain = [...currentState.currentHitChain, shotPos];

  let newQueue: Position[] = [];

  if (newHitChain.length === 1) {
    // Single hit: add all 4 adjacent orthogonals
    newQueue = getAdjacentPositions(shotPos).filter((p) => !isAlreadyTargeted(trackingGrid, p));
  } else {
    // 2 or more hits: determine line orientation (horizontal vs vertical)
    const isHorizontal = newHitChain.every((p) => p.y === newHitChain[0].y);
    const isVertical = newHitChain.every((p) => p.x === newHitChain[0].x);

    if (isHorizontal) {
      const y = newHitChain[0].y;
      const xCoords = newHitChain.map((p) => p.x);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);

      const left = { x: minX - 1, y };
      const right = { x: maxX + 1, y };

      if (!isAlreadyTargeted(trackingGrid, left)) newQueue.push(left);
      if (!isAlreadyTargeted(trackingGrid, right)) newQueue.push(right);
    } else if (isVertical) {
      const x = newHitChain[0].x;
      const yCoords = newHitChain.map((p) => p.y);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);

      const top = { x, y: minY - 1 };
      const bottom = { x, y: maxY + 1 };

      if (!isAlreadyTargeted(trackingGrid, top)) newQueue.push(top);
      if (!isAlreadyTargeted(trackingGrid, bottom)) newQueue.push(bottom);
    } else {
      // Non-linear hits fallback to adjacent positions around latest hit
      newQueue = getAdjacentPositions(shotPos).filter((p) => !isAlreadyTargeted(trackingGrid, p));
    }
  }

  // Combine with existing queue, deduplicate and filter
  const combined = [...newQueue, ...currentState.targetQueue];
  const uniqueQueue: Position[] = [];
  for (const p of combined) {
    if (!isAlreadyTargeted(trackingGrid, p) && !uniqueQueue.some((u) => u.x === p.x && u.y === p.y)) {
      uniqueQueue.push(p);
    }
  }

  return {
    mode: 'TARGET',
    targetQueue: uniqueQueue,
    currentHitChain: newHitChain
  };
}
