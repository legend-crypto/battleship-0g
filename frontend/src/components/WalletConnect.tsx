import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { Wallet, LogOut, WalletCards, ShieldCheck } from 'lucide-react';
import { ZERO_G_GALILEO_TESTNET } from '../config/wagmi';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: balance } = useBalance({
    address,
  });

  if (isConnected && address) {
    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2 bg-[#0F172A]/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-200 font-semibold">{truncatedAddress}</span>
          {balance && (
            <span className="text-emerald-400 font-bold ml-1">
              {Number(balance.formatted).toFixed(2)} {balance.symbol}
            </span>
          )}
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
            {address.substring(2, 3).toUpperCase()}
          </div>
        </div>

        <button
          onClick={() => disconnect()}
          className="p-2 bg-[#0F172A] hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition border border-slate-700"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0];
          if (injectedConnector) {
            connect({ connector: injectedConnector });
          }
        }}
        className="flex items-center space-x-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider transition border border-slate-700/80 shadow-md cursor-pointer group"
      >
        <span>CONNECT WALLET</span>
        <WalletCards className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
      </button>

      {error && (
        <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-mono">
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};
