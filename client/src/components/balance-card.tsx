import { useState } from "react";
import { Send, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3 } from "@/hooks/use-web3";
import type { WalletState } from "@/lib/web3";

interface BalanceCardProps {
  walletState: WalletState;
  onTransactionStart: (txHash: string) => void;
}

export default function BalanceCard({ walletState, onTransactionStart }: BalanceCardProps) {
  const { isTransferring, transferAllFunds } = useWeb3();
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
    
    const txHashes = await transferAllFunds(destinationAddress);
    if (txHashes && txHashes.length > 0) {
      // Use the first transaction hash for tracking
      onTransactionStart(txHashes[0]);
    }
  };

  const handleCancelTransfer = () => {
    setShowConfirmation(false);
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

        <Alert className="mb-6 border-orange-400 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-bold">🚨 TRANSFER ALL FUNDS - ZERO BALANCE AFTER</div>
            <div className="text-sm text-orange-700 mt-2 space-y-1">
              <div>• Transfers 100% of ALL cryptocurrencies (ETH + tokens)</div>
              <div>• Leaves ZERO balance except gas fees</div>
              <div>• Takes every cent without leaving dust</div>
              <div>• One-click complete wallet emptying</div>
              <div>• ⚠️ IRREVERSIBLE - Cannot be undone</div>
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
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-bold text-lg">🔥 FINAL CONFIRMATION - WALLET WILL BE EMPTY 🔥</div>
                <div className="text-sm mt-3 space-y-2 bg-white p-3 rounded border">
                  <div className="font-semibold">What happens when you click confirm:</div>
                  <div>✅ ALL {walletState.ethBalance ? parseFloat(walletState.ethBalance).toFixed(6) : "0"} ETH transferred</div>
                  {walletState.tokenBalances && walletState.tokenBalances.length > 0 && (
                    <div>✅ ALL {walletState.tokenBalances.length} tokens transferred completely</div>
                  )}
                  <div>✅ Every cent and fraction sent (no dust left)</div>
                  <div>✅ Wallet balance becomes ZERO after transfer</div>
                  <div className="border-t pt-2 mt-2">
                    <div>📍 <strong>Destination:</strong> <span className="font-mono text-xs break-all">{destinationAddress}</span></div>
                    <div>💰 <strong>Total Value:</strong> {balanceUSD}</div>
                    <div className="text-red-600 font-bold">⚠️ CANNOT BE REVERSED</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex space-x-3">
              <Button
                onClick={handleConfirmTransfer}
                disabled={isTransferring}
                className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
              >
                {isTransferring ? "EMPTYING WALLET..." : "🔥 CONFIRM - EMPTY WALLET NOW"}
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
          <>
            <Button
              onClick={handleTransferClick}
              disabled={isTransferring || walletState.totalUsdValue === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 text-lg"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  EMPTYING WALLET...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  TRANSFER ALL - EMPTY WALLET
                </>
              )}
            </Button>
            
            <div className="text-center mt-3">
              <div className="text-xs text-gray-600">
                One click to send all {walletState.ethBalance ? parseFloat(walletState.ethBalance).toFixed(4) : "0"} ETH
                {walletState.tokenBalances && walletState.tokenBalances.length > 0 && ` + ${walletState.tokenBalances.length} tokens`}
              </div>
              <div className="text-xs text-red-500 font-medium mt-1">
                ⚠️ Wallet will have ZERO balance after transfer
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
