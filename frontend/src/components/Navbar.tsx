import React, { useState } from 'react';
import { WalletConnect } from './WalletConnect';
import { ChevronDown, Menu, X, Home, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'WHITEPAPER' | 'ABOUT';
  onSelectTab: (tab: 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'WHITEPAPER' | 'ABOUT') => void;
  onGoHome?: () => void;
  isDarkTheme?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onGoHome, isDarkTheme = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      onSelectTab('PLAY');
    }
  };

  const handleNavClick = (tab: 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'WHITEPAPER' | 'ABOUT') => {
    if (tab === 'PLAY' && onGoHome) {
      onGoHome();
    } else {
      onSelectTab(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`w-full py-4 px-4 sm:px-8 lg:px-12 flex items-center justify-between z-40 transition-colors ${
      isDarkTheme ? 'bg-[#050B0E]/95 border-b border-slate-800/80 backdrop-blur-md' : 'bg-[#F4F7F6]/90 backdrop-blur-sm border-b border-slate-200/80'
    }`}>
      {/* Brand Logo & Ultra-Readable Title */}
      <div
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={handleLogoClick}
        title="Return to Home / Landing Page"
      >
        <img
          src="/logo.png"
          alt="0G Battleship Logo"
          className="w-10 h-10 object-contain rounded-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
        />
        <div>
          <h1 className="font-mono text-base sm:text-lg font-black tracking-wider flex items-center gap-1.5 drop-shadow-sm">
            <span className="text-emerald-600 font-extrabold">0G</span>
            <span className={isDarkTheme ? 'text-white' : 'text-slate-950 font-black'}>BATTLESHIP</span>
          </h1>
          <p className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-widest -mt-1">
            BUILT ON <span className="text-emerald-600 font-extrabold">0G NETWORK</span>
          </p>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8 font-mono text-xs font-bold tracking-wider">
        <button
          onClick={() => handleNavClick('PLAY')}
          className={`flex items-center space-x-1.5 transition-colors cursor-pointer py-1 ${
            activeTab === 'PLAY'
              ? 'text-emerald-600 border-b-2 border-emerald-600 pb-0.5'
              : isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>HOME / PLAY</span>
        </button>

        <button
          onClick={() => handleNavClick('MATCHES')}
          className={`transition-colors cursor-pointer py-1 ${
            activeTab === 'MATCHES'
              ? 'text-emerald-600 border-b-2 border-emerald-600 pb-0.5'
              : isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          MATCHES
        </button>

        <button
          onClick={() => handleNavClick('LEADERBOARD')}
          className={`transition-colors cursor-pointer py-1 ${
            activeTab === 'LEADERBOARD'
              ? 'text-emerald-600 border-b-2 border-emerald-600 pb-0.5'
              : isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          LEADERBOARD
        </button>

        <button
          onClick={() => handleNavClick('WHITEPAPER')}
          className={`transition-colors cursor-pointer py-1 flex items-center gap-1 ${
            activeTab === 'WHITEPAPER'
              ? 'text-emerald-600 border-b-2 border-emerald-600 pb-0.5'
              : isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>WHITEPAPER</span>
        </button>

        <button
          onClick={() => handleNavClick('ABOUT')}
          className={`transition-colors cursor-pointer py-1 ${
            activeTab === 'ABOUT'
              ? 'text-emerald-600 border-b-2 border-emerald-600 pb-0.5'
              : isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          ABOUT
        </button>
      </nav>

      {/* Network Selector Pill & Wallet Connection Button */}
      <div className="hidden sm:flex items-center space-x-4">
        {/* Network Selector Pill */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
          isDarkTheme ? 'bg-[#091015] border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>0G MAINNET (16661)</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Wallet Connect Button */}
        <WalletConnect />
      </div>

      {/* Mobile Hamburger Menu Toggle */}
      <div className="flex sm:hidden items-center space-x-2">
        <WalletConnect />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-700 hover:text-slate-950 rounded-lg bg-white border border-slate-300 shadow-sm"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 space-y-3 font-mono text-xs font-bold md:hidden shadow-2xl z-50">
          <button
            onClick={() => handleNavClick('PLAY')}
            className="block w-full text-left py-2 px-3 rounded-lg text-emerald-400 bg-slate-900 flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>HOME / PLAY</span>
          </button>
          <button
            onClick={() => handleNavClick('MATCHES')}
            className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 hover:bg-slate-900"
          >
            MATCHES
          </button>
          <button
            onClick={() => handleNavClick('LEADERBOARD')}
            className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 hover:bg-slate-900"
          >
            LEADERBOARD
          </button>
          <button
            onClick={() => handleNavClick('WHITEPAPER')}
            className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 hover:bg-slate-900"
          >
            WHITEPAPER
          </button>
          <button
            onClick={() => handleNavClick('ABOUT')}
            className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 hover:bg-slate-900"
          >
            ABOUT
          </button>
        </div>
      )}
    </header>
  );
};
