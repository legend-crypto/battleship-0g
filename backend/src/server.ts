import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';
import {
  SocketEvent,
  CreateMatchPayload,
  JoinMatchPayload,
  SubmitPlacementPayload,
  FireShotPayload,
  ReconnectPayload,
  StakeConfirmedPayload
} from '@battleship/shared';
import { MatchManager } from './MatchManager.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const matchManager = new MatchManager();

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: '0G Battleship Multiplayer Backend' });
});

app.get('/api/lobbies', (_req, res) => {
  res.json({ lobbies: matchManager.getPublicLobbies() });
});

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on(SocketEvent.LIST_MATCHES, () => {
    socket.emit(SocketEvent.MATCH_LIST_UPDATED, matchManager.getPublicLobbies());
  });

  socket.on(SocketEvent.CREATE_MATCH, (payload: CreateMatchPayload) => {
    try {
      const { matchId, matchCode, matchIdBytes32, playerToken, player1Id } = matchManager.createMatch(
        socket.id,
        payload.playerName,
        payload.stakeAmountEth || '0.1',
        payload.playerAddress
      );

      socket.join(matchId);
      socket.emit(SocketEvent.MATCH_CREATED, {
        matchId,
        matchCode,
        matchIdBytes32,
        stakeAmountEth: payload.stakeAmountEth || '0.1',
        playerToken,
        playerId: player1Id
      });

      io.emit(SocketEvent.MATCH_LIST_UPDATED, matchManager.getPublicLobbies());
    } catch (err: any) {
      socket.emit(SocketEvent.ERROR, { message: err.message });
    }
  });

  socket.on(SocketEvent.JOIN_MATCH, (payload: JoinMatchPayload) => {
    try {
      const { session, playerToken, player2Id } = matchManager.joinMatch(
        socket.id,
        payload.matchCode,
        payload.playerName,
        payload.playerAddress
      );

      socket.join(session.matchId);

      io.to(session.matchId).emit(SocketEvent.PLAYER_JOINED, {
        matchId: session.matchId,
        matchCode: session.matchCode,
        matchIdBytes32: session.matchIdBytes32,
        stakeAmountEth: session.stakeAmountEth,
        phase: session.phase,
        player1: { id: session.player1.id, name: session.player1.name, address: session.player1.address },
        player2: { id: session.player2!.id, name: session.player2!.name, address: session.player2!.address }
      });

      socket.emit('match:joined_self', {
        playerToken,
        playerId: player2Id
      });

      io.emit(SocketEvent.MATCH_LIST_UPDATED, matchManager.getPublicLobbies());
    } catch (err: any) {
      socket.emit(SocketEvent.ERROR, { message: err.message });
    }
  });

  socket.on(SocketEvent.STAKE_CONFIRMED, (payload: StakeConfirmedPayload) => {
    try {
      const { session, bothStaked } = matchManager.confirmStake(payload.matchId, payload.playerToken);

      io.to(session.matchId).emit(SocketEvent.STAKING_READY, {
        matchId: session.matchId,
        p1Staked: session.player1.hasStaked,
        p2Staked: session.player2?.hasStaked || false
      });

      if (bothStaked) {
        io.to(session.matchId).emit(SocketEvent.STAKING_COMPLETED, {
          matchId: session.matchId,
          phase: session.phase
        });
      }
    } catch (err: any) {
      socket.emit(SocketEvent.ERROR, { message: err.message });
    }
  });

  socket.on(SocketEvent.SUBMIT_PLACEMENT, (payload: SubmitPlacementPayload) => {
    try {
      const { session, bothReady } = matchManager.submitPlacement(
        payload.matchId,
        payload.playerToken,
        payload.ships
      );

      io.to(session.matchId).emit(SocketEvent.PLAYER_READY, {
        matchId: session.matchId,
        p1Ready: session.player1.isReady,
        p2Ready: session.player2?.isReady || false
      });

      if (bothReady) {
        io.to(session.matchId).emit(SocketEvent.GAME_START, {
          matchId: session.matchId,
          currentTurn: session.currentTurn
        });
      }
    } catch (err: any) {
      socket.emit(SocketEvent.ERROR, { message: err.message });
    }
  });

  socket.on(SocketEvent.FIRE_SHOT, async (payload: FireShotPayload) => {
    try {
      const { session, shooter, target, result, gameOver, payoutSignature } = await matchManager.processShot(
        payload.matchId,
        payload.playerToken,
        payload.pos
      );

      io.to(session.matchId).emit(SocketEvent.SHOT_RESOLVED, {
        matchId: session.matchId,
        shooterId: shooter.id,
        pos: payload.pos,
        hit: result.hit,
        sunkShipType: result.sunkShipType,
        currentTurn: session.currentTurn,
        gameOver,
        winnerId: session.winnerId
      });

      if (gameOver) {
        io.to(session.matchId).emit(SocketEvent.GAME_OVER, {
          matchId: session.matchId,
          winnerId: session.winnerId,
          winnerAddress: session.winnerAddress,
          payoutSignature,
          totalPayoutEth: (Number(session.stakeAmountEth) * 2).toString(),
          player1Board: session.player1.board,
          player2Board: session.player2!.board
        });
      }
    } catch (err: any) {
      socket.emit(SocketEvent.ERROR, { message: err.message });
    }
  });

  socket.on(SocketEvent.RECONNECT, (payload: ReconnectPayload) => {
    try {
      const { session, player, opponentSocketId } = matchManager.reconnect(
        socket.id,
        payload.matchId,
        payload.playerToken
      );

      socket.join(session.matchId);

      if (opponentSocketId) {
        io.to(opponentSocketId).emit(SocketEvent.PLAYER_RECONNECTED, {
          playerId: player.id,
          playerName: player.name
        });
      }

      const opponent = session.player1.id === player.id ? session.player2 : session.player1;

      socket.emit(SocketEvent.RECONNECT_SUCCESS, {
        matchId: session.matchId,
        matchIdBytes32: session.matchIdBytes32,
        stakeAmountEth: session.stakeAmountEth,
        phase: session.phase,
        currentTurn: session.currentTurn,
        playerBoard: player.board,
        trackingGrid: player.trackingGrid,
        hasStaked: player.hasStaked,
        opponentStaked: opponent ? opponent.hasStaked : false,
        opponentConnected: opponent ? opponent.connected : false,
        opponentName: opponent ? opponent.name : 'Opponent'
      });
    } catch (err: any) {
      socket.emit(SocketEvent.ERROR, { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const { session, disconnectedPlayer, opponentSocketId } = matchManager.handleDisconnect(socket.id);

    if (session && opponentSocketId && disconnectedPlayer) {
      io.to(opponentSocketId).emit(SocketEvent.PLAYER_DISCONNECTED, {
        playerId: disconnectedPlayer.id,
        playerName: disconnectedPlayer.name,
        message: 'Opponent disconnected. 60s reconnect window active.'
      });
    }
  });
});

export { app, server, matchManager };

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 0G Battleship server running on port ${PORT}`);
  });
}
