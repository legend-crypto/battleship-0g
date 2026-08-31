import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Query list of open waiting lobbies for multiplayer lobby
export const listOpenLobbies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('matches')
      .withIndex('by_status', (q) => q.eq('status', 'WAITING'))
      .order('desc')
      .take(20);
  }
});

// Query single match state by matchIdBytes32
export const getMatchByBytes32 = query({
  args: { matchIdBytes32: v.string() },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();
    return match;
  }
});

// Mutation to host a new match lobby
export const createLobby = mutation({
  args: {
    matchIdBytes32: v.string(),
    stakeAmountEth: v.string(),
    hostAddress: v.string(),
    hostToken: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (existing) return existing._id;

    const id = await ctx.db.insert('matches', {
      matchIdBytes32: args.matchIdBytes32,
      stakeAmountEth: args.stakeAmountEth,
      status: 'WAITING',
      hostAddress: args.hostAddress,
      hostToken: args.hostToken,
      logs: [
        {
          id: `${Date.now()}-1`,
          sender: 'PLAYER',
          message: `Lobby created by ${args.hostAddress.slice(0, 6)}...${args.hostAddress.slice(-4)}. Stake: ${args.stakeAmountEth} 0G`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          type: 'info'
        }
      ],
      createdAt: Date.now()
    });

    return id;
  }
});

// Mutation for guest to join match
export const joinLobby = mutation({
  args: {
    matchIdBytes32: v.string(),
    guestAddress: v.string(),
    guestToken: v.string()
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchIdBytes32', args.matchIdBytes32))
      .first();

    if (!match) throw new Error('Match not found');

    await ctx.db.patch(match._id, {
      guestAddress: args.guestAddress,
      guestToken: args.guestToken,
      status: 'PLACEMENT',
      logs: [
        ...match.logs,
        {
          id: `${Date.now()}-join`,
          sender: 'OPPONENT',
          message: `Player 2 (${args.guestAddress.slice(0, 6)}...${args.guestAddress.slice(-4)}) joined match! Deploy fleet.`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          type: 'info'
        }
      ]
    });

    return match._id;
  }
});
