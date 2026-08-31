import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { Wallet, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { ZERO_G_GALILEO_TESTNET } from '../config/wagmi';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: balance } = useBalance({
    address,
  });

  const isCorrectChain = chain?.id === ZERO_G_GALILEO_TESTNET.id;

  if (isConnected && address) {
    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300 font-semibold">{truncatedAddress}</span>
          {balance && (
            <span className="text-cyan-400 font-bold ml-1">
              {Number(balance.formatted).toFixed(3)} {balance.symbol}
            </span>
          )}
        </div>

        <button
          onClick={() => disconnect()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-xl transition border border-slate-700"
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
        className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold transition text-sm shadow-lg shadow-cyan-500/20"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>

      {error && (
        <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};
