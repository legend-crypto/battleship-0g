import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { wagmiConfig } from './config/wagmi';
import { ConvexErrorBoundary } from './components/ConvexErrorBoundary';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://fine-rooster-248.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexErrorBoundary>
      <ConvexProvider client={convex}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </WagmiProvider>
      </ConvexProvider>
    </ConvexErrorBoundary>
  </React.StrictMode>,
);
