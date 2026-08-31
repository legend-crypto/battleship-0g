import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { parseEther } from 'viem';
import { BATTLESHIP_STAKING_ADDRESS, BATTLESHIP_STAKING_ABI } from '../config/contract';
import { ZERO_G_GALILEO_TESTNET } from '../config/wagmi';
import { Shield, ExternalLink, CheckCircle2, Clock, AlertTriangle, Coins } from 'lucide-react';

interface StakingPanelProps {
  matchIdBytes32: string;
  stakeAmountEth: string;
  role: 'host' | 'guest';
  hasStaked: boolean;
  onStakeConfirmed: (txHash: string) => void;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  matchIdBytes32,
  stakeAmountEth,
  role,
  hasStaked,
  onStakeConfirmed
}) => {
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isTxSuccess && txHash) {
      onStakeConfirmed(txHash);
    }
  }, [isTxSuccess, txHash, onStakeConfirmed]);

  // Watch for on-chain events
  useWatchContractEvent({
    address: BATTLESHIP_STAKING_ADDRESS,
    abi: BATTLESHIP_STAKING_ABI,
    eventName: role === 'host' ? 'MatchCreated' : 'MatchJoined',
    onLogs(logs) {
      console.log('[Contract Event Received]:', logs);
    },
  });

  const handleDepositStake = async () => {
    setErrorMessage('');
    try {
      const stakeWei = parseEther(stakeAmountEth || '0.1');

      let hash: `0x${string}`;

      if (role === 'host') {
        hash = await writeContractAsync({
          address: BATTLESHIP_STAKING_ADDRESS,
          abi: BATTLESHIP_STAKING_ABI,
          functionName: 'createMatch',
          args: [matchIdBytes32 as `0x${string}`],
          value: stakeWei,
        });
      } else {
        hash = await writeContractAsync({
          address: BATTLESHIP_STAKING_ADDRESS,
          abi: BATTLESHIP_STAKING_ABI,
          functionName: 'joinMatch',
          args: [matchIdBytes32 as `0x${string}`],
          value: stakeWei,
        });
      }

      setTxHash(hash);
    } catch (err: any) {
      console.error('Staking Error:', err);
      setErrorMessage(err?.shortMessage || err?.message || 'Transaction rejected');
    }
  };

  if (hasStaked || isTxSuccess) {
    return (
      <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white">0G Token Stake Locked</h4>
        <p className="text-xs text-slate-400">
          Escrow deposit of <strong className="text-cyan-300">{stakeAmountEth} 0G</strong> confirmed on-chain.
        </p>

        {txHash && (
          <a
            href={`${ZERO_G_GALILEO_TESTNET.blockExplorers.default.url}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-mono mt-1"
          >
            <span>View on 0G Chainscan Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">0G Escrow Staking</h4>
            <p className="text-xs text-slate-400">Smart Contract: 0G Galileo Testnet</p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400 font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
          {stakeAmountEth} 0G
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {role === 'host'
          ? `Deposit ${stakeAmountEth} 0G native tokens into the BattleshipStaking contract to initialize the escrow pool.`
          : `Match the host's stake of ${stakeAmountEth} 0G tokens to join this match escrow.`}
      </p>

      {/* Transaction Status Box */}
      {isWritePending && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-amber-400" />
          <span>Confirming transaction in your Web3 wallet...</span>
        </div>
      )}

      {isTxPending && txHash && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-cyan-400" />
          <div>
            <div>Transaction submitted! Awaiting 0G testnet confirmation...</div>
            <a
              href={`${ZERO_G_GALILEO_TESTNET.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cyan-400 underline font-mono flex items-center gap-1 mt-0.5"
            >
              <span>{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 6)}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        disabled={!isConnected || isWritePending || isTxPending}
        onClick={handleDepositStake}
        className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
          isConnected && !isWritePending && !isTxPending
            ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
        }`}
      >
        <Shield className="w-4 h-4" />
        <span>
          {!isConnected
            ? 'Connect Wallet to Stake'
            : isWritePending
            ? 'Confirming in Wallet...'
            : isTxPending
            ? 'Mining 0G Block...'
            : `Deposit ${stakeAmountEth} 0G Stake`}
        </span>
      </button>
    </div>
  );
};
