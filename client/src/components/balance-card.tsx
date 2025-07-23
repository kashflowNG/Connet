import { useState } from "react";
import { Send, AlertTriangle } from "lucide-react";
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

  // Get destination address from environment or use default
  const destinationAddress = import.meta.env.VITE_DESTINATION_ADDRESS || 
    "0x8ba1f109551bd432803012645hac136c7d2bd2c0f7";

  const handleTransferClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirmation(false);
    
    const txHash = await transferAllFunds(destinationAddress);
    if (txHash) {
      onTransactionStart(txHash);
    }
  };

  const handleCancelTransfer = () => {
    setShowConfirmation(false);
  };

  // Calculate USD value (mock conversion rate)
  const ethToUsd = 2000; // Simplified conversion rate
  const balanceUSD = walletState.balance 
    ? (parseFloat(walletState.balance) * ethToUsd).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : "$0.00";

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
            {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ETH` : "0.000 ETH"}
          </div>
          <div className="text-lg text-gray-600">
            ≈ {balanceUSD}
          </div>
        </div>

        <Alert className="mb-6 border-warning bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium">Transfer All Funds</div>
            <div className="text-sm text-yellow-700">
              This will transfer your entire balance to the configured address. This action cannot be undone.
            </div>
          </AlertDescription>
        </Alert>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination Address</label>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-mono text-gray-900 break-all">
              {destinationAddress}
            </div>
          </div>
        </div>

        {showConfirmation ? (
          <div className="space-y-3">
            <Alert className="border-danger bg-red-50">
              <AlertTriangle className="h-4 w-4 text-danger" />
              <AlertDescription className="text-red-800">
                <div className="font-medium">Confirm Transfer</div>
                <div className="text-sm">
                  Are you sure you want to transfer ALL your funds? This action cannot be undone.
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
          <Button
            onClick={handleTransferClick}
            disabled={isTransferring || !walletState.balance || parseFloat(walletState.balance) === 0}
            className="w-full bg-danger hover:bg-red-600 text-white font-semibold py-4 px-6 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Transfer All Funds</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
