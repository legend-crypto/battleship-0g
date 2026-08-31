export const BATTLESHIP_STAKING_MAINNET_ADDRESS = '0x6114CB30740c77C37971E0468F7662E3ec52e6Cc' as `0x${string}`;
export const BATTLESHIP_STAKING_TESTNET_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`;

// Default active contract for website: 0G Mainnet Deployed Smart Contract
export const BATTLESHIP_STAKING_ADDRESS =
  (import.meta.env.VITE_STAKING_CONTRACT_ADDRESS as `0x${string}`) ||
  BATTLESHIP_STAKING_MAINNET_ADDRESS;

export const BATTLESHIP_STAKING_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_arbiter', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'InvalidSignature',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidStakeAmount',
    type: 'error'
  },
  {
    inputs: [],
    name: 'MatchAlreadyExists',
    type: 'error'
  },
  {
    inputs: [],
    name: 'MatchNotInState',
    type: 'error'
  },
  {
    inputs: [],
    name: 'MismatchedStake',
    type: 'error'
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error'
  },
  {
    inputs: [],
    name: 'TimeoutNotReached',
    type: 'error'
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error'
  },
  {
    inputs: [],
    name: 'UnauthorizedPlayer',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'newArbiter', type: 'address' }
    ],
    name: 'ArbiterUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'player1', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'stakeAmount', type: 'uint256' }
    ],
    name: 'MatchCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'player2', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'stakeAmount', type: 'uint256' }
    ],
    name: 'MatchJoined',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'Refunded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'winner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'StakeClaimed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'winner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'totalPayout', type: 'uint256' }
    ],
    name: 'WinnerDeclared',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'matchId', type: 'bytes32' }],
    name: 'cancelUnjoinedMatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' }
    ],
    name: 'claimPayout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' }
    ],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'matchId', type: 'bytes32' }],
    name: 'claimTimeoutRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'matchId', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' }
    ],
    name: 'claimWinnerPayout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'matchId', type: 'bytes32' }],
    name: 'createMatch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'matchId', type: 'bytes32' }],
    name: 'joinMatch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;
