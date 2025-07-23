import { useState } from "react";
import { ChevronDown, ChevronUp, Network, RefreshCw, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { NetworkBalance } from "@/lib/web3";

interface NetworkBalancesProps {
  networkBalances: NetworkBalance[];
  isLoadingNetworks: boolean;
  onRefreshNetworks: () => void;
}

export default function NetworkBalances({ 
  networkBalances, 
  isLoadingNetworks, 
  onRefreshNetworks 
}: NetworkBalancesProps) {
  const [openNetworks, setOpenNetworks] = useState<Set<string>>(new Set());

  const toggleNetwork = (networkId: string) => {
    const newOpenNetworks = new Set(openNetworks);
    if (newOpenNetworks.has(networkId)) {
      newOpenNetworks.delete(networkId);
    } else {
      newOpenNetworks.add(networkId);
    }
    setOpenNetworks(newOpenNetworks);
  };

  const totalUsdValue = networkBalances.reduce((sum, network) => sum + network.totalUsdValue, 0);
  const networksWithBalances = networkBalances.filter(network => 
    network.totalUsdValue > 0 || network.tokenBalances.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Multi-Network Portfolio
          </CardTitle>
          <Button
            onClick={onRefreshNetworks}
            disabled={isLoadingNetworks}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingNetworks ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {totalUsdValue > 0 && (
          <div className="text-2xl font-bold text-green-600">
            ${totalUsdValue.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoadingNetworks && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Scanning networks for balances...</p>
          </div>
        )}

        {!isLoadingNetworks && networksWithBalances.length === 0 && (
          <div className="text-center py-8">
            <Coins className="h-8 w-8 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No balances found across networks</p>
            <p className="text-sm text-gray-500 mt-2">
              Try refreshing or check if your wallet has funds on supported networks
            </p>
          </div>
        )}

        {networksWithBalances.map((network) => {
          const isOpen = openNetworks.has(network.networkId);
          const hasNativeBalance = parseFloat(network.nativeBalance) > 0;
          const hasTokens = network.tokenBalances.length > 0;
          
          return (
            <Collapsible key={network.networkId}>
              <CollapsibleTrigger 
                asChild
                onClick={() => toggleNetwork(network.networkId)}
              >
                <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        network.isConnected ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium">{network.networkName}</span>
                      {network.isConnected && (
                        <Badge variant="secondary" className="text-xs">Connected</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">
                        ${network.totalUsdValue.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {hasNativeBalance && `${parseFloat(network.nativeBalance).toFixed(4)} ${network.nativeCurrency}`}
                        {hasNativeBalance && hasTokens && " + "}
                        {hasTokens && `${network.tokenBalances.length} token${network.tokenBalances.length !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-3 mt-2">
                  {/* Native Currency Balance */}
                  {hasNativeBalance && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {network.nativeCurrency[0]}
                        </div>
                        <div>
                          <div className="font-medium">{network.nativeCurrency}</div>
                          <div className="text-sm text-gray-600">Native Currency</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {parseFloat(network.nativeBalance).toFixed(6)} {network.nativeCurrency}
                        </div>
                        <div className="text-sm text-gray-600">
                          ${(parseFloat(network.nativeBalance) * (network.totalUsdValue / (parseFloat(network.nativeBalance) + network.tokenBalances.reduce((sum, token) => sum + parseFloat(token.balance), 0)))).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Token Balances */}
                  {network.tokenBalances.map((token, index) => (
                    <div key={`${token.contractAddress}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {token.symbol[0]}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-600 font-mono text-xs">
                            {token.contractAddress?.slice(0, 8)}...{token.contractAddress?.slice(-6)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {parseFloat(token.balance).toFixed(6)} {token.symbol}
                        </div>
                        <div className="text-sm text-gray-600">
                          ${(token.usdValue || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {!isLoadingNetworks && networksWithBalances.length > 0 && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Found assets across {networksWithBalances.length} network{networksWithBalances.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}