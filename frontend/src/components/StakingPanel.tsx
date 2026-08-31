import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BATTLESHIP_STAKING_ADDRESS, BATTLESHIP_STAKING_ABI } from '../config/contract';
import { ZERO_G_GALILEO_TESTNET } from '../config/wagmi';
import { Coins, ExternalLink, ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { parseEther } from 'viem';

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
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash
  });

  React.useEffect(() => {
    if (isConfirmed && txHash) {
      onStakeConfirmed(txHash);
    }
  }, [isConfirmed, txHash, onStakeConfirmed]);

  const handleDepositStake = async () => {
    setErrorMessage(null);
    try {
      const valueWei = parseEther(stakeAmountEth);

      if (role === 'host') {
        const hash = await writeContractAsync({
          address: BATTLESHIP_STAKING_ADDRESS,
          abi: BATTLESHIP_STAKING_ABI,
          functionName: 'createMatch',
          args: [matchIdBytes32 as `0x${string}`, valueWei],
          value: valueWei
        });
        setTxHash(hash);
      } else {
        const hash = await writeContractAsync({
          address: BATTLESHIP_STAKING_ADDRESS,
          abi: BATTLESHIP_STAKING_ABI,
          functionName: 'joinMatch',
          args: [matchIdBytes32 as `0x${string}`],
          value: valueWei
        });
        setTxHash(hash);
      }
    } catch (err: any) {
      console.error('Staking error:', err);
      setErrorMessage(err.shortMessage || err.message || 'Transaction rejected');
    }
  };

  return (
    <div className="w-full max-w-md bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-2xl font-mono text-left space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>0G TOKEN ESCROW STAKE</span>
        </h3>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
          CHAIN ID 16602
        </span>
      </div>

      <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Required Match Stake:</span>
          <span className="text-emerald-400 font-bold text-sm">{stakeAmountEth} 0G</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Escrow Smart Contract:</span>
          <span className="text-slate-200 font-mono text-[10px]">BattleshipStaking.sol</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Network:</span>
          <span className="text-slate-200 font-semibold">0G Galileo Testnet</span>
        </div>
      </div>

      {hasStaked || isConfirmed ? (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>0G Escrow Deposit Confirmed!</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-sans">
            Your stake is safely escrowed in the smart contract. Awaiting opponent deposit confirmation...
          </p>
          {txHash && (
            <a
              href={`${ZERO_G_GALILEO_TESTNET.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 underline font-mono flex items-center gap-1 mt-1"
            >
              <span>View Transaction on 0G Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!isConnected ? (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs rounded-xl text-center">
              Connect Web3 wallet in header to deposit 0G stake.
            </div>
          ) : (
            <button
              disabled={isWritePending || isConfirming}
              onClick={handleDepositStake}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isWritePending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CONFIRM IN WALLET...</span>
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>MINING ON 0G TESTNET...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>DEPOSIT {stakeAmountEth} 0G STAKE</span>
                </>
              )}
            </button>
          )}

          {txHash && (
            <a
              href={`${ZERO_G_GALILEO_TESTNET.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400 underline font-mono flex items-center justify-center gap-1"
            >
              <span>View Pending Tx on 0G Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-[11px] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
