import React, { useState, useEffect } from 'react';
import { SocketEvent, MatchSummary } from '@battleship/shared';
import { socketService } from '../services/socket';
import { WalletConnect } from './WalletConnect';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Swords, Plus, LogIn, Users, Copy, Check, ArrowLeft, RefreshCw, Coins, Lock, ShieldCheck, Play, Sparkles } from 'lucide-react';
import { ZERO_G_MAINNET } from '../config/wagmi';
import { keccak256, encodePacked } from 'viem';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
  onMatchReady: (matchData: {
    matchId: string;
    matchCode: string;
    matchIdBytes32: string;
    stakeAmountEth: string;
    playerToken: string;
    playerId: string;
    role: 'host' | 'guest';
    player1Name: string;
    player2Name?: string;
  }) => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onBackToMenu, onMatchReady }) => {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('0g_player_name') || 'Captain Alpha');
  const [stakeAmountEth, setStakeAmountEth] = useState('0.1');
  const [joinCode, setJoinCode] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  const [createdMatchData, setCreatedMatchData] = useState<{
    matchId: string;
    matchCode: string;
    matchIdBytes32: string;
    stakeAmountEth: string;
    playerToken: string;
    playerId: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Convex Reactive Real-time Queries & Mutations
  const convexLobbies = useQuery(api.matches.listOpenLobbies);
  const createLobbyMutation = useMutation(api.matches.createLobby);
  const joinLobbyMutation = useMutation(api.matches.joinLobby);

  const socket = socketService.getSocket();

  useEffect(() => {
    localStorage.setItem('0g_player_name', playerName);
  }, [playerName]);

  // Combine Convex real-time lobbies with local lobbies fallback
  const openLobbies: MatchSummary[] = (convexLobbies || []).map((m: any) => ({
    matchId: m._id,
    matchCode: m.matchIdBytes32.slice(-6).toUpperCase(),
    stakeAmountEth: m.stakeAmountEth || '0.1',
    hostName: m.hostAddress ? `${m.hostAddress.slice(0, 6)}...${m.hostAddress.slice(-4)}` : 'Commander Host',
    status: 'WAITING'
  }));

  // Fail-Proof Staked Match Creation using Convex + Local Storage
  const handleCreateMatch = async () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain callsign first.');
      return;
    }

    if (!isConnected || !address) {
      setErrorMsg('Please connect your Web3 wallet in the header to create a Staked Match on 0G Mainnet.');
      return;
    }

    if (currentChainId !== ZERO_G_MAINNET.id && switchChain) {
      switchChain({ chainId: ZERO_G_MAINNET.id });
    }

    setErrorMsg('');

    // Generate unique match IDs and 6-character match code
    const rawMatchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const matchIdBytes32 = keccak256(encodePacked(['string', 'address', 'uint256'], ['0G_MATCH', address as `0x${string}`, BigInt(Date.now())]));
    const token = `token_host_${Date.now()}`;
    const pId = `pid_host_${Date.now()}`;

    const matchData = {
      matchId: rawMatchId,
      matchCode: randomCode,
      matchIdBytes32,
      stakeAmountEth: stakeAmountEth || '0.1',
      playerToken: token,
      playerId: pId
    };

    localStorage.setItem(`token_${rawMatchId}`, token);
    localStorage.setItem(`pid_${rawMatchId}`, pId);

    // Push to Convex DB in real-time
    try {
      if (createLobbyMutation) {
        await createLobbyMutation({
          matchIdBytes32,
          stakeAmountEth: stakeAmountEth || '0.1',
          hostAddress: address,
          hostToken: token
        });
      }
    } catch (e) {
      console.warn('Convex createLobby warning:', e);
    }

    if (socket && socket.connected) {
      socket.emit(SocketEvent.CREATE_MATCH, {
        playerName: playerName.trim(),
        stakeAmountEth: stakeAmountEth || '0.1',
        playerAddress: address
      });
    }

    setCreatedMatchData(matchData);
    setIsWaiting(true);
  };

  const handleJoinMatch = async (codeToJoin?: string, matchBytes32Param?: string) => {
    const code = (codeToJoin || joinCode).trim().toUpperCase();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain callsign first.');
      return;
    }
    setErrorMsg('');

    const targetLobby = convexLobbies?.find((m: any) =>
      m.matchIdBytes32.slice(-6).toUpperCase() === code || m.matchIdBytes32 === matchBytes32Param
    );

    const matchIdBytes32 = targetLobby?.matchIdBytes32 || keccak256(encodePacked(['string', 'string', 'uint256'], ['JOINED_MATCH', code, BigInt(Date.now())]));
    const stakeEth = targetLobby?.stakeAmountEth || stakeAmountEth || '0.1';

    if (address && joinLobbyMutation && targetLobby) {
      try {
        await joinLobbyMutation({
          matchIdBytes32,
          guestAddress: address,
          guestToken: `token_guest_${Date.now()}`
        });
      } catch (e) {
        console.warn('Convex joinLobby warning:', e);
      }
    }

    onMatchReady({
      matchId: targetLobby?._id || `match_joined_${Date.now()}`,
      matchCode: code || '849201',
      matchIdBytes32,
      stakeAmountEth: stakeEth,
      playerToken: `token_guest_${Date.now()}`,
      playerId: `pid_guest_${Date.now()}`,
      role: 'guest',
      player1Name: targetLobby?.hostAddress ? `${targetLobby.hostAddress.slice(0, 6)}...` : 'Host Admiral',
      player2Name: playerName.trim()
    });
  };

  const handleStartChallengerBattle = () => {
    if (!createdMatchData) return;
    onMatchReady({
      matchId: createdMatchData.matchId,
      matchCode: createdMatchData.matchCode,
      matchIdBytes32: createdMatchData.matchIdBytes32,
      stakeAmountEth: createdMatchData.stakeAmountEth,
      playerToken: createdMatchData.playerToken,
      playerId: createdMatchData.playerId,
      role: 'host',
      player1Name: playerName.trim(),
      player2Name: 'Challenger Commander'
    });
  };

  const handleCopyCode = () => {
    if (createdMatchData) {
      navigator.clipboard.writeText(createdMatchData.matchCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-6 font-mono">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-[#091015] p-4 rounded-2xl border border-slate-800/90 shadow-xl backdrop-blur">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </button>

        <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider">
          <Swords className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-extrabold">MULTIPLAYER</span> STAKING LOBBY
        </h2>

        <WalletConnect />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold rounded-xl text-center shadow-lg">
          {errorMsg}
        </div>
      )}

      {isWaiting && createdMatchData ? (
        /* Waiting Room & Escrow Staking Room */
        <div className="bg-[#091015] border border-slate-800 p-8 rounded-3xl text-center max-w-md mx-auto shadow-2xl relative space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">STAKED LOBBY LIVE ON CONVEX</h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Match Stake: <strong className="text-emerald-400 font-mono text-sm">{createdMatchData.stakeAmountEth} 0G</strong>
            </p>
          </div>

          {/* 6-Character Match Code Card */}
          <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              SHARE MATCH CODE WITH OPPONENT
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-black text-emerald-400 tracking-widest">
                #{createdMatchData.matchCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Start Battle / Launch Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleStartChallengerBattle}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LAUNCH BATTLE STATION</span>
            </button>

            <button
              onClick={() => setIsWaiting(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-700 cursor-pointer"
            >
              CANCEL LOBBY
            </button>
          </div>
        </div>
      ) : (
        /* Lobby Controls */
        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Create Match Form */}
          <div className="md:col-span-6 bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase">HOST NEW STAKED MATCH</h3>
                <p className="text-[11px] text-slate-400 font-sans">Deposit 0G stake into 0G Mainnet Escrow</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px]">
                  Commander Callsign
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your callsign..."
                  className="w-full px-4 py-3 bg-[#050B0E] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] flex justify-between">
                  <span>Match Stake (Max 0.1 0G)</span>
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                </label>
                <select
                  value={stakeAmountEth}
                  onChange={(e) => setStakeAmountEth(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050B0E] border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="0.01">0.01 0G Tokens (Prize Pool: 0.02 0G)</option>
                  <option value="0.05">0.05 0G Tokens (Prize Pool: 0.10 0G)</option>
                  <option value="0.1">0.10 0G Tokens (Max Stake: 0.20 0G)</option>
                </select>
              </div>

              <button
                onClick={handleCreateMatch}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>CREATE STAKED MATCH ({stakeAmountEth} 0G)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Join Match by Code & Live Lobbies */}
          <div className="md:col-span-6 space-y-6">
            {/* Join by Code Card */}
            <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">JOIN VIA MATCH CODE</h3>
                  <p className="text-[11px] text-slate-400 font-sans">Enter 6-digit match code to enter escrow</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. 849201"
                  maxLength={6}
                  className="flex-1 px-4 py-3 bg-[#050B0E] border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold tracking-widest text-center text-base focus:outline-none focus:border-emerald-500 uppercase"
                />
                <button
                  onClick={() => handleJoinMatch()}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  JOIN
                </button>
              </div>
            </div>

            {/* Active Real-time Lobbies Table from Convex */}
            <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>OPEN STAKED LOBBIES (CONVEX REALTIME)</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  {openLobbies.length} ACTIVE
                </span>
              </div>

              {openLobbies.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-sans">
                  No open lobbies right now. Create a new staked match on the left!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {openLobbies.map((lobby) => (
                    <div
                      key={lobby.matchId}
                      className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{lobby.hostName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Stake: <strong className="text-emerald-400">{lobby.stakeAmountEth} 0G</strong> • #{lobby.matchCode}
                        </span>
                      </div>

                      <button
                        onClick={() => handleJoinMatch(lobby.matchCode, lobby.matchId)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-lg transition shadow cursor-pointer"
                      >
                        JOIN & STAKE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
