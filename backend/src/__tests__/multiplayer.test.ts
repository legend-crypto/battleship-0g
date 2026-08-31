import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { server } from '../server.js';
import { SocketEvent, generateRandomBoard } from '@battleship/shared';
import AddressInfo from 'net';

describe('Multiplayer Backend Socket Flow', () => {
  let p1Socket: ClientSocketType;
  let p2Socket: ClientSocketType;
  let serverPort: number;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          serverPort = addr.port;
        } else {
          serverPort = 4000;
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    if (p1Socket) p1Socket.disconnect();
    if (p2Socket) p2Socket.disconnect();
    server.close();
  });

  it('should execute complete 2-player multiplayer lifecycle', async () => {
    const serverUrl = `http://localhost:${serverPort}`;

    p1Socket = ClientSocket(serverUrl, { forceNew: true });
    p2Socket = ClientSocket(serverUrl, { forceNew: true });

    await new Promise<void>((resolve) => {
      let connectedCount = 0;
      const onConnect = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };
      p1Socket.on('connect', onConnect);
      p2Socket.on('connect', onConnect);
    });

    let matchId = '';
    let matchCode = '';
    let p1Token = '';
    let p1Id = '';
    let p2Token = '';
    let p2Id = '';

    // Step 1: P1 creates match
    const p1CreatePromise = new Promise<void>((resolve) => {
      p1Socket.on(SocketEvent.MATCH_CREATED, (data: any) => {
        matchId = data.matchId;
        matchCode = data.matchCode;
        p1Token = data.playerToken;
        p1Id = data.playerId;
        expect(matchId).toBeDefined();
        expect(matchCode).toHaveLength(6);
        resolve();
      });
    });

    p1Socket.emit(SocketEvent.CREATE_MATCH, { playerName: 'Captain P1' });
    await p1CreatePromise;

    // Step 2: P2 joins match by code
    const p2JoinPromise = new Promise<void>((resolve) => {
      p2Socket.on('match:joined_self', (data: any) => {
        p2Token = data.playerToken;
        p2Id = data.playerId;
        expect(p2Token).toBeDefined();
        resolve();
      });
    });

    p2Socket.emit(SocketEvent.JOIN_MATCH, { matchCode, playerName: 'Captain P2' });
    await p2JoinPromise;

    // Step 3: Both players submit ship placements
    const p1Board = generateRandomBoard();
    const p2Board = generateRandomBoard();

    const gameStartPromise = new Promise<string>((resolve) => {
      p1Socket.on(SocketEvent.GAME_START, (data: any) => {
        expect(data.matchId).toBe(matchId);
        resolve(data.currentTurn);
      });
    });

    p1Socket.emit(SocketEvent.SUBMIT_PLACEMENT, {
      matchId,
      playerToken: p1Token,
      ships: p1Board.ships
    });

    p2Socket.emit(SocketEvent.SUBMIT_PLACEMENT, {
      matchId,
      playerToken: p2Token,
      ships: p2Board.ships
    });

    const initialTurnPlayerId = await gameStartPromise;
    expect(initialTurnPlayerId).toBeDefined();

    // Step 4: Fire a valid shot from active player
    const activeSocket = initialTurnPlayerId === p1Id ? p1Socket : p2Socket;
    const activeToken = initialTurnPlayerId === p1Id ? p1Token : p2Token;

    const shotResolvedPromise = new Promise<void>((resolve) => {
      activeSocket.on(SocketEvent.SHOT_RESOLVED, (data: any) => {
        expect(data.matchId).toBe(matchId);
        expect(data.pos).toEqual({ x: 0, y: 0 });
        resolve();
      });
    });

    activeSocket.emit(SocketEvent.FIRE_SHOT, {
      matchId,
      playerToken: activeToken,
      pos: { x: 0, y: 0 }
    });

    await shotResolvedPromise;
  }, 10000);
});
