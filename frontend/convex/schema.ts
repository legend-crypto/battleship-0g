import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  matches: defineTable({
    matchIdBytes32: v.string(),
    stakeAmountEth: v.string(),
    status: v.union(
      v.literal('WAITING'),
      v.literal('PLACEMENT'),
      v.literal('PLAYING'),
      v.literal('FINISHED'),
      v.literal('CANCELLED')
    ),
    hostAddress: v.string(),
    hostToken: v.string(),
    guestAddress: v.optional(v.string()),
    guestToken: v.optional(v.string()),
    
    // Board states encoded as JSON string arrays
    hostBoard: v.optional(v.string()),
    guestBoard: v.optional(v.string()),
    
    // Tracking grids encoded as JSON string
    hostTracking: v.optional(v.string()),
    guestTracking: v.optional(v.string()),
    
    currentTurn: v.optional(v.union(v.literal('host'), v.literal('guest'))),
    winnerAddress: v.optional(v.string()),
    payoutSignature: v.optional(v.string()),
    
    logs: v.array(
      v.object({
        id: v.string(),
        sender: v.union(v.literal('PLAYER'), v.literal('AI'), v.literal('OPPONENT')),
        message: v.string(),
        timestamp: v.string(),
        type: v.union(v.literal('hit'), v.literal('miss'), v.literal('sunk'), v.literal('info'))
      })
    ),
    createdAt: v.number()
  })
    .index('by_status', ['status'])
    .index('by_matchId', ['matchIdBytes32'])
});
