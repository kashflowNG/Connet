
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";

// Network configurations with icons and colors
const NETWORKS = {
  "1": {
    name: "Ethereum",
    shortName: "ETH",
    chainId: 1,
    icon: "⟠",
    color: "bg-blue-500",
    rpcUrl: "https://mainnet.infura.io/v3/",
    blockExplorer: "https://etherscan.io"
  },
  "137": {
    name: "Polygon",
    shortName: "MATIC",
    chainId: 137,
    icon: "⬟",
    color: "bg-purple-500",
    rpcUrl: "https://polygon-rpc.com/",
    blockExplorer: "https://polygonscan.com"
  },
  "56": {
    name: "BNB Smart Chain",
    shortName: "BSC",
    chainId: 56,
    icon: "⬢",
    color: "bg-yellow-500",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com"
  },
  "43114": {
    name: "Avalanche",
    shortName: "AVAX",
    chainId: 43114,
    icon: "🔺",
    color: "bg-red-500",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io"
  },
  "250": {
    name: "Fantom",
    shortName: "FTM",
    chainId: 250,
    icon: "👻",
    color: "bg-blue-400",
    rpcUrl: "https://rpc.ftm.tools/",
    blockExplorer: "https://ftmscan.com"
  },
  "42161": {
    name: "Arbitrum One",
    shortName: "ARB",
    chainId: 42161,
    icon: "🔵",
    color: "bg-blue-600",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io"
  },
  "10": {
    name: "Optimism",
    shortName: "OP",
    chainId: 10,
    icon: "🔴",
    color: "bg-red-400",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io"
  }
};

export default function NetworkSwitcher() {
  const { walletState, refreshBalance } = useWeb3();
  const { toast } = useToast();
  const [isSwitching, setIsSwitching] = useState(false);

  const currentNetwork = walletState.networkId ? NETWORKS[walletState.networkId as keyof typeof NETWORKS] : null;

  const switchNetwork = async (networkId: string) => {
    const targetNetwork = NETWORKS[networkId as keyof typeof NETWORKS];
    if (!targetNetwork || !window.ethereum) return;

    setIsSwitching(true);
    const hexChainId = `0x${targetNetwork.chainId.toString(16)}`;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });

      toast({
        title: "Network Switched",
        description: `Successfully switched to ${targetNetwork.name}`,
      });

      // Refresh balance after network switch
      setTimeout(() => {
        refreshBalance();
      }, 1000);

    } catch (error: any) {
      // If network doesn't exist in wallet, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: hexChainId,
              chainName: targetNetwork.name,
              nativeCurrency: {
                name: targetNetwork.shortName,
                symbol: targetNetwork.shortName,
                decimals: 18,
              },
              rpcUrls: [targetNetwork.rpcUrl],
              blockExplorerUrls: [targetNetwork.blockExplorer],
            }],
          });

          toast({
            title: "Network Added & Switched",
            description: `${targetNetwork.name} has been added to your wallet`,
          });

          setTimeout(() => {
            refreshBalance();
          }, 1000);

        } catch (addError: any) {
          toast({
            variant: "destructive",
            title: "Failed to Add Network",
            description: addError.message || "Could not add network to wallet",
          });
        }
      } else if (error.code === 4001) {
        toast({
          variant: "destructive",
          title: "Network Switch Cancelled",
          description: "You cancelled the network switch request",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Network Switch Failed",
          description: error.message || "Could not switch network",
        });
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (!walletState.isConnected) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground font-medium">Network:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2 min-w-[140px] justify-between hover:bg-muted/50"
            disabled={isSwitching}
          >
            <div className="flex items-center space-x-2">
              {currentNetwork ? (
                <>
                  <div className={`w-3 h-3 rounded-full ${currentNetwork.color} flex items-center justify-center`}>
                    <span className="text-xs text-white">{currentNetwork.icon}</span>
                  </div>
                  <span className="text-sm font-medium">{currentNetwork.name}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <span className="text-sm">Unknown Network</span>
                </>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(NETWORKS).map(([networkId, network]) => {
            const isCurrentNetwork = walletState.networkId === networkId;
            
            return (
              <DropdownMenuItem
                key={networkId}
                onClick={() => !isCurrentNetwork && switchNetwork(networkId)}
                className={`flex items-center justify-between cursor-pointer ${
                  isCurrentNetwork ? 'bg-muted/50' : 'hover:bg-muted/50'
                }`}
                disabled={isCurrentNetwork || isSwitching}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${network.color} flex items-center justify-center`}>
                    <span className="text-xs text-white">{network.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{network.name}</span>
                    <span className="text-xs text-muted-foreground">{network.shortName}</span>
                  </div>
                </div>
                {isCurrentNetwork && <Check className="w-4 h-4 text-green-500" />}
              </DropdownMenuItem>
            );
          })}
          
          <div className="px-2 py-1 mt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Switch networks to access different tokens and DeFi protocols
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentNetwork && (
        <Badge variant="secondary" className="text-xs">
          {currentNetwork.shortName}
        </Badge>
      )}
    </div>
  );
}
