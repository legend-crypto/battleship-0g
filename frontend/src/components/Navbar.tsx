import React, { useState } from 'react';
import { WalletConnect } from './WalletConnect';
import { ChevronDown, Menu, X, Home } from 'lucide-react';

interface NavbarProps {
  activeTab: 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'ABOUT';
  onSelectTab: (tab: 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'ABOUT') => void;
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

  const handleNavClick = (tab: 'PLAY' | 'MATCHES' | 'LEADERBOARD' | 'ABOUT') => {
    if (tab === 'PLAY' && onGoHome) {
      onGoHome();
    } else {
      onSelectTab(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`w-full py-4 px-4 sm:px-8 lg:px-12 flex items-center justify-between z-40 transition-colors ${
      isDarkTheme ? 'bg-[#050B0E]/95 border-b border-slate-800/80 backdrop-blur-md' : 'bg-transparent'
    }`}>
      {/* Brand Logo (Clicking navigates to Landing Home page!) */}
      <div
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={handleLogoClick}
        title="Return to Home / Landing Page"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-black font-mono text-emerald-400 text-lg shadow-sm group-hover:scale-105 transition-transform">
          0G
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-wider text-emerald-500 font-mono">0G</span>
            <span className={`font-black text-xl tracking-wider font-mono ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
              BATTLESHIP
            </span>
          </div>
          <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            BUILT ON <span className="text-emerald-500 font-bold">0G NETWORK</span>
          </p>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:flex items-center space-x-8 font-mono text-xs tracking-widest font-bold">
        {(['PLAY', 'MATCHES', 'LEADERBOARD', 'ABOUT'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleNavClick(tab)}
              className={`relative py-1.5 transition-all cursor-pointer uppercase ${
                isActive
                  ? 'text-emerald-500 font-extrabold'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab === 'PLAY' ? 'HOME / PLAY' : tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Network Selector + Wallet + Mobile Menu Toggle */}
      <div className="flex items-center space-x-3">
        {/* Network Selector Pill */}
        <div className={`hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border text-xs font-mono font-semibold cursor-pointer transition ${
          isDarkTheme
            ? 'bg-[#091015] border-slate-800 text-slate-300 hover:border-slate-700'
            : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm backdrop-blur'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>GALILEO TESTNET</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <WalletConnect />

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg border text-slate-400 hover:text-white transition ${
            isDarkTheme ? 'bg-[#091015] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-Out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] bg-[#091015] border-b border-slate-800 p-4 shadow-2xl z-50 flex flex-col space-y-3 font-mono text-xs font-bold animate-fade-in">
          {(['PLAY', 'MATCHES', 'LEADERBOARD', 'ABOUT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleNavClick(tab)}
              className={`py-2.5 px-4 rounded-lg text-left transition flex items-center justify-between uppercase ${
                activeTab === tab
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{tab === 'PLAY' ? 'HOME / PLAY' : tab}</span>
              {tab === 'PLAY' && <Home className="w-4 h-4 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
