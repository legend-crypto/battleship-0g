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
import { ConvexErrorBoundary } from './ConvexErrorBoundary';

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

// Inner component that safely uses Convex hooks
const RealtimeConvexLobbies: React.FC<{
  onJoinMatch: (code: string, matchIdBytes32?: string) => void;
  localLobbies: MatchSummary[];
}> = ({ onJoinMatch, localLobbies }) => {
  let convexLobbies: any[] | undefined;
  try {
    convexLobbies = useQuery(api.matches.listOpenLobbies);
  } catch (e) {
    console.warn('Convex listOpenLobbies query warning:', e);
  }

  const openLobbies: MatchSummary[] = (convexLobbies && convexLobbies.length > 0)
    ? convexLobbies.map((m: any) => ({
        matchId: m._id,
        matchCode: m.matchIdBytes32 ? m.matchIdBytes32.slice(-6).toUpperCase() : '849201',
        stakeAmountEth: m.stakeAmountEth || '0.1',
        hostName: m.hostAddress ? `${m.hostAddress.slice(0, 6)}...${m.hostAddress.slice(-4)}` : 'Commander Host',
        status: 'WAITING'
      }))
    : localLobbies;

  return (
    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
      {openLobbies.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-sans">
          No open lobbies right now. Create a new staked match on the left!
        </div>
      ) : (
        openLobbies.map((lobby) => (
          <div
            key={lobby.matchId}
            className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
          >
            <div>
              <span className="font-bold text-white block">{lobby.hostName}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                Stake: <strong className="text-emerald-400">{lobby.stakeAmountEth} 0G</strong> • #{lobby.matchCode}
              </span>
            </div>

            <button
              onClick={() => onJoinMatch(lobby.matchCode, lobby.matchId)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-lg transition shadow cursor-pointer flex items-center gap-1"
            >
              <span>JOIN & STAKE</span>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onBackToMenu, onMatchReady }) => {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('0g_player_name') || 'Captain Alpha');
  const [stakeAmountEth, setStakeAmountEth] = useState('0.1');
  const [joinCode, setJoinCode] = useState('');
  const [localLobbies, setLocalLobbies] = useState<MatchSummary[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Safe Convex mutation hooks
  let createLobbyMutation: any;
  let joinLobbyMutation: any;
  try {
    createLobbyMutation = useMutation(api.matches.createLobby);
    joinLobbyMutation = useMutation(api.matches.joinLobby);
  } catch (e) {
    console.warn('Convex mutation hooks init warning:', e);
  }

  const socket = socketService.getSocket();

  useEffect(() => {
    localStorage.setItem('0g_player_name', playerName);
  }, [playerName]);

  // Load existing saved local lobbies
  useEffect(() => {
    try {
      const saved = localStorage.getItem('0g_open_lobbies');
      if (saved) {
        setLocalLobbies(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse local lobbies:', e);
    }
  }, []);

  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit(SocketEvent.LIST_MATCHES);

      socket.on(SocketEvent.MATCH_LIST_UPDATED, (data: MatchSummary[]) => {
        if (data && data.length > 0) setLocalLobbies(data);
      });

      socket.on(SocketEvent.PLAYER_JOINED, (data: any) => {
        onMatchReady({
          matchId: data.matchId,
          matchCode: data.matchCode,
          matchIdBytes32: data.matchIdBytes32,
          stakeAmountEth: data.stakeAmountEth || '0.1',
          playerToken: localStorage.getItem(`token_${data.matchId}`) || '',
          playerId: localStorage.getItem(`pid_${data.matchId}`) || '',
          role: 'host',
          player1Name: data.player1?.name || playerName,
          player2Name: data.player2?.name || 'Challenger'
        });
      });

      socket.on(SocketEvent.ERROR, (data: { message: string }) => {
        setErrorMsg(data.message);
      });

      return () => {
        socket.off(SocketEvent.MATCH_LIST_UPDATED);
        socket.off(SocketEvent.PLAYER_JOINED);
        socket.off(SocketEvent.ERROR);
      };
    }
  }, [socket, onMatchReady, playerName]);

  // Synchronous, Non-Blocking Staked Match Creation
  const handleCreateMatch = () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain callsign first.');
      return;
    }

    if (!isConnected || !address) {
      setErrorMsg('Please connect your Web3 wallet in the header to create a Staked Match on 0G Mainnet.');
      return;
    }

    if (currentChainId !== ZERO_G_MAINNET.id && switchChain) {
      try {
        switchChain({ chainId: ZERO_G_MAINNET.id });
      } catch (e) {
        console.warn('Network switch warning:', e);
      }
    }

    setErrorMsg('');

    // Generate unique match IDs and 6-character match code
    const rawMatchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const matchIdBytes32 = keccak256(encodePacked(['string', 'address', 'uint256'], ['0G_MATCH', address as `0x${string}`, BigInt(Date.now())]));
    const token = `token_host_${Date.now()}`;
    const pId = `pid_host_${Date.now()}`;

    localStorage.setItem(`token_${rawMatchId}`, token);
    localStorage.setItem(`pid_${rawMatchId}`, pId);

    // Save locally
    const newLobby: MatchSummary = {
      matchId: rawMatchId,
      matchCode: randomCode,
      stakeAmountEth: stakeAmountEth || '0.1',
      hostName: playerName.trim(),
      status: 'WAITING'
    };

    setLocalLobbies((prev) => {
      const updated = [newLobby, ...prev];
      localStorage.setItem('0g_open_lobbies', JSON.stringify(updated));
      return updated;
    });

    // Non-blocking Convex mutation in background
    if (createLobbyMutation) {
      createLobbyMutation({
        matchIdBytes32,
        stakeAmountEth: stakeAmountEth || '0.1',
        hostAddress: address,
        hostToken: token
      }).catch((e: any) => console.warn('Convex createLobby non-blocking warning:', e));
    }

    if (socket && socket.connected) {
      socket.emit(SocketEvent.CREATE_MATCH, {
        playerName: playerName.trim(),
        stakeAmountEth: stakeAmountEth || '0.1',
        playerAddress: address
      });
    }

    // IMMEDIATELY ENTER MATCH STATION & STAKING PANEL (ZERO LATENCY!)
    onMatchReady({
      matchId: rawMatchId,
      matchCode: randomCode,
      matchIdBytes32,
      stakeAmountEth: stakeAmountEth || '0.1',
      playerToken: token,
      playerId: pId,
      role: 'host',
      player1Name: playerName.trim(),
      player2Name: 'Awaiting Opponent...'
    });
  };

  // Synchronous, Non-Blocking Join Match
  const handleJoinMatch = (codeToJoin?: string, matchBytes32Param?: string) => {
    const code = (codeToJoin || joinCode).trim().toUpperCase();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain callsign first.');
      return;
    }
    setErrorMsg('');

    const matchIdBytes32 = matchBytes32Param || keccak256(encodePacked(['string', 'string', 'uint256'], ['JOINED_MATCH', code, BigInt(Date.now())]));

    if (address && joinLobbyMutation) {
      joinLobbyMutation({
        matchIdBytes32,
        guestAddress: address,
        guestToken: `token_guest_${Date.now()}`
      }).catch((e: any) => console.warn('Convex joinLobby non-blocking warning:', e));
    }

    // IMMEDIATELY ENTER STAKING PANEL AS GUEST
    onMatchReady({
      matchId: `match_joined_${Date.now()}`,
      matchCode: code || '849201',
      matchIdBytes32,
      stakeAmountEth: stakeAmountEth || '0.1',
      playerToken: `token_guest_${Date.now()}`,
      playerId: `pid_guest_${Date.now()}`,
      role: 'guest',
      player1Name: 'Host Admiral',
      player2Name: playerName.trim()
    });
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

      {/* Lobby Controls */}
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
              <span>CREATE & DEPOSIT {stakeAmountEth} 0G STAKE</span>
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

          {/* Active Lobbies Table */}
          <div className="bg-[#091015] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>OPEN STAKED LOBBIES</span>
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                {localLobbies.length} ACTIVE
              </span>
            </div>

            <ConvexErrorBoundary
              fallback={
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {localLobbies.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs font-sans">
                      No open lobbies right now. Create a new staked match on the left!
                    </div>
                  ) : (
                    localLobbies.map((lobby) => (
                      <div
                        key={lobby.matchId}
                        className="p-3 bg-[#050B0E] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
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
                    ))
                  )}
                </div>
              }
            >
              <RealtimeConvexLobbies onJoinMatch={handleJoinMatch} localLobbies={localLobbies} />
            </ConvexErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
