import React, { useState, useEffect } from 'react';
import { SocketEvent, MatchSummary } from '@battleship/shared';
import { socketService } from '../services/socket';
import { WalletConnect } from './WalletConnect';
import { useAccount } from 'wagmi';
import { Swords, Plus, LogIn, Users, Copy, Check, ArrowLeft, RefreshCw, Coins } from 'lucide-react';

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
  const { address } = useAccount();
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('0g_player_name') || 'Captain Alpha');
  const [stakeAmountEth, setStakeAmountEth] = useState('0.1');
  const [joinCode, setJoinCode] = useState('');
  const [lobbies, setLobbies] = useState<MatchSummary[]>([]);
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

  const socket = socketService.getSocket();

  useEffect(() => {
    localStorage.setItem('0g_player_name', playerName);
  }, [playerName]);

  useEffect(() => {
    socket.emit(SocketEvent.LIST_MATCHES);

    socket.on(SocketEvent.MATCH_LIST_UPDATED, (data: MatchSummary[]) => {
      setLobbies(data || []);
    });

    socket.on(SocketEvent.MATCH_CREATED, (data: {
      matchId: string;
      matchCode: string;
      matchIdBytes32: string;
      stakeAmountEth: string;
      playerToken: string;
      playerId: string;
    }) => {
      setCreatedMatchData(data);
      setIsWaiting(true);
      setErrorMsg('');
    });

    socket.on(SocketEvent.PLAYER_JOINED, (data: {
      matchId: string;
      matchCode: string;
      matchIdBytes32: string;
      stakeAmountEth: string;
      player1: { id: string; name: string };
      player2: { id: string; name: string };
    }) => {
      const token = createdMatchData?.playerToken || localStorage.getItem(`token_${data.matchId}`) || '';
      const pId = createdMatchData?.playerId || localStorage.getItem(`pid_${data.matchId}`) || '';

      onMatchReady({
        matchId: data.matchId,
        matchCode: data.matchCode,
        matchIdBytes32: data.matchIdBytes32,
        stakeAmountEth: data.stakeAmountEth || createdMatchData?.stakeAmountEth || '0.1',
        playerToken: token,
        playerId: pId,
        role: createdMatchData ? 'host' : 'guest',
        player1Name: data.player1.name,
        player2Name: data.player2.name
      });
    });

    socket.on(SocketEvent.ERROR, (data: { message: string }) => {
      setErrorMsg(data.message);
    });

    return () => {
      socket.off(SocketEvent.MATCH_LIST_UPDATED);
      socket.off(SocketEvent.MATCH_CREATED);
      socket.off(SocketEvent.PLAYER_JOINED);
      socket.off(SocketEvent.ERROR);
    };
  }, [socket, createdMatchData, onMatchReady]);

  const handleCreateMatch = () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain name first.');
      return;
    }
    setErrorMsg('');
    socket.emit(SocketEvent.CREATE_MATCH, {
      playerName: playerName.trim(),
      stakeAmountEth: stakeAmountEth || '0.1',
      playerAddress: address
    });
  };

  const handleJoinMatch = (codeToJoin?: string) => {
    const code = (codeToJoin || joinCode).trim().toUpperCase();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your captain name first.');
      return;
    }
    if (!code) {
      setErrorMsg('Please enter a valid 6-character match code.');
      return;
    }
    setErrorMsg('');
    socket.emit(SocketEvent.JOIN_MATCH, {
      matchCode: code,
      playerName: playerName.trim(),
      playerAddress: address
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Main Menu</span>
        </button>

        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Swords className="w-5 h-5 text-indigo-400" />
          <span>Multiplayer Staking Lobby</span>
        </h2>

        <WalletConnect />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      {isWaiting && createdMatchData ? (
        /* Waiting Room Overlay */
        <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center max-w-md mx-auto shadow-2xl shadow-indigo-950/40">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Waiting for Opponent</h3>
          <p className="text-xs text-slate-400 mb-2">
            Match Stake: <strong className="text-cyan-300">{createdMatchData.stakeAmountEth} 0G</strong>
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-mono text-3xl font-black text-cyan-400 tracking-widest bg-slate-950 px-6 py-3 rounded-2xl border border-cyan-500/30 shadow-inner">
              {createdMatchData.matchCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700"
              title="Copy Code"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Listening for socket connection...
          </div>
        </div>
      ) : (
        /* Lobby Controls */
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Create & Join Form */}
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Captain Callsign
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter callsign..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>0G Token Stake per Player</span>
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
              </label>
              <select
                value={stakeAmountEth}
                onChange={(e) => setStakeAmountEth(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="0.1">0.1 0G Tokens</option>
                <option value="0.5">0.5 0G Tokens</option>
                <option value="1.0">1.0 0G Tokens</option>
                <option value="2.5">2.5 0G Tokens</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleCreateMatch}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Staked Match</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Join by Room Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="BAT824"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-cyan-300 uppercase tracking-widest focus:outline-none focus:border-cyan-500 text-center"
                />
                <button
                  onClick={() => handleJoinMatch()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Join</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Public Lobbies */}
          <div className="md:col-span-2 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Open Staking Lobbies ({lobbies.length})</span>
              </h3>
              <button
                onClick={() => socket.emit(SocketEvent.LIST_MATCHES)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lobbies.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs italic">
                  No public lobbies waiting. Create one to start!
                </div>
              ) : (
                lobbies.map((lobby) => (
                  <div
                    key={lobby.matchId}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{lobby.hostName}'s Match</div>
                      <div className="font-mono text-xs text-slate-400">
                        Code: <span className="text-cyan-400 font-bold">{lobby.matchCode}</span> • Stake: <strong className="text-cyan-300">{lobby.stakeAmountEth} 0G</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinMatch(lobby.matchCode)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
                    >
                      Join & Stake
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
