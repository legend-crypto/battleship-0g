import React, { useState, useEffect } from 'react';
import { SocketEvent, MatchSummary } from '@battleship/shared';
import { socketService } from '../services/socket';
import { WalletConnect } from './WalletConnect';
import { useAccount } from 'wagmi';
import { Swords, Plus, LogIn, Users, Copy, Check, ArrowLeft, RefreshCw, Coins, Lock, ShieldCheck } from 'lucide-react';

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
      setErrorMsg('Please enter your captain callsign first.');
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
      setErrorMsg('Please enter your captain callsign first.');
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
        /* Waiting Room Overlay */
        <div className="bg-[#091015] border border-slate-800 p-8 rounded-3xl text-center max-w-md mx-auto shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">WAITING FOR OPPONENT</h3>
          <p className="text-xs text-slate-400 mb-4 font-sans">
            Match Escrow Stake: <strong className="text-emerald-400 font-mono">{createdMatchData.stakeAmountEth} 0G</strong>
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-mono text-3xl font-black text-emerald-400 tracking-widest bg-[#050B0E] px-6 py-3 rounded-2xl border border-emerald-500/40 shadow-inner">
              {createdMatchData.matchCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 cursor-pointer"
              title="Copy Code"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Listening for opponent connection on 0G Galileo Testnet...
          </div>
        </div>
      ) : (
        /* Lobby Controls */
        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* Create & Join Form (5 cols) */}
          <div className="md:col-span-5 bg-[#091015] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Captain Callsign
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter callsign..."
                className="w-full px-4 py-2.5 bg-[#050B0E] border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>0G Token Stake per Player</span>
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
              </label>
              <select
                value={stakeAmountEth}
                onChange={(e) => setStakeAmountEth(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#050B0E] border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
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
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE STAKED MATCH</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Join by Room Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="BAT824"
                  className="w-full px-3 py-2 bg-[#050B0E] border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest focus:outline-none focus:border-emerald-500 text-center"
                />
                <button
                  onClick={() => handleJoinMatch()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>JOIN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Public Lobbies (7 cols) */}
          <div className="md:col-span-7 bg-[#091015] p-6 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>OPEN STAKING LOBBIES ({lobbies.length})</span>
              </h3>
              <button
                onClick={() => socket.emit(SocketEvent.LIST_MATCHES)}
                className="p-2 text-slate-400 hover:text-white bg-[#050B0E] border border-slate-800 rounded-lg transition cursor-pointer"
                title="Refresh Lobbies"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {lobbies.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No public lobbies waiting. Create one to start!
                </div>
              ) : (
                lobbies.map((lobby) => (
                  <div
                    key={lobby.matchId}
                    className="p-3.5 bg-[#050B0E] rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-emerald-500/40 transition"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-200">{lobby.hostName}'s Match</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        Code: <span className="text-emerald-400 font-bold">{lobby.matchCode}</span> • Stake: <strong className="text-emerald-400">{lobby.stakeAmountEth} 0G</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinMatch(lobby.matchCode)}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md cursor-pointer"
                    >
                      JOIN & STAKE
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
