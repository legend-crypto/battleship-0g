import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const ZERO_G_MAINNET = {
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Chainscan Mainnet', url: 'https://chainscan.0g.ai' },
  },
};

export const ZERO_G_GALILEO_TESTNET = {
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Chainscan Testnet', url: 'https://chainscan-galileo.0g.ai' },
  },
};

export const wagmiConfig = createConfig({
  chains: [ZERO_G_MAINNET as any, ZERO_G_GALILEO_TESTNET as any],
  connectors: [
    injected({ shimDisconnect: true })
  ],
  transports: {
    [ZERO_G_MAINNET.id]: http('https://evmrpc.0g.ai'),
    [ZERO_G_GALILEO_TESTNET.id]: http('https://evmrpc-testnet.0g.ai'),
  },
});
