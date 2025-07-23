import { useState } from "react";
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

export default function Home() {
  const { walletState, isConnecting, isLoadingNetworks, connectWallet, refreshAllNetworks } = useWeb3();
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary flex items-center">
                <Coins className="mr-2" />
                Multi-Crypto Transfer
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={walletState.isConnected ? undefined : handleWalletConnect}
                disabled={isConnecting}
                className={`flex items-center space-x-2 ${
                  walletState.isConnected
                    ? "bg-success hover:bg-green-600"
                    : "bg-primary hover:bg-blue-700"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Status */}
        <WalletStatus walletState={walletState} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Balance Card */}
          <BalanceCard 
            walletState={walletState}
            onTransactionStart={handleTransactionStart}
          />

          {/* Transaction History */}
          <TransactionHistory />
        </div>

        {/* Multi-Network Balances */}
        {walletState.isConnected && (
          <div className="mt-8">
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">⚠️ This platform transfers ALL cryptocurrencies in your wallet (ETH + ERC-20 tokens). Use with caution.</p>
            <p className="text-sm">Always verify the destination address before confirming transactions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
