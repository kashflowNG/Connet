import { useState } from "react";
import { ChevronDown, Check, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Network {
  id: string;
  name: string;
  shortName: string;
  nativeCurrency: string;
  chainId: number;
  color: string;
  icon: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const SUPPORTED_NETWORKS: Network[] = [
  {
    id: "1",
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    nativeCurrency: "ETH",
    chainId: 1,
    color: "bg-blue-500",
    icon: "⟠",
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"]
  },
  {
    id: "137",
    name: "Polygon",
    shortName: "Polygon",
    nativeCurrency: "MATIC",
    chainId: 137,
    color: "bg-purple-500",
    icon: "⬢",
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com"]
  },
  {
    id: "56",
    name: "BNB Smart Chain",
    shortName: "BSC",
    nativeCurrency: "BNB",
    chainId: 56,
    color: "bg-yellow-500",
    icon: "◆",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"]
  },
  {
    id: "43114",
    name: "Avalanche",
    shortName: "Avalanche",
    nativeCurrency: "AVAX",
    chainId: 43114,
    color: "bg-red-500",
    icon: "▲",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"]
  },
  {
    id: "250",
    name: "Fantom",
    shortName: "Fantom",
    nativeCurrency: "FTM",
    chainId: 250,
    color: "bg-blue-400",
    icon: "♦",
    rpcUrls: ["https://rpc.ftm.tools/"],
    blockExplorerUrls: ["https://ftmscan.com"]
  },
  {
    id: "42161",
    name: "Arbitrum One",
    shortName: "Arbitrum",
    nativeCurrency: "ETH",
    chainId: 42161,
    color: "bg-cyan-500",
    icon: "🔺",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"]
  },
  {
    id: "10",
    name: "Optimism",
    shortName: "Optimism",
    nativeCurrency: "ETH",
    chainId: 10,
    color: "bg-red-400",
    icon: "🔴",
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"]
  }
];

interface NetworkSwitcherProps {
  currentNetworkId?: string;
  onNetworkSwitch?: (networkId: string) => void;
  isConnected: boolean;
}

export default function NetworkSwitcher({ 
  currentNetworkId, 
  onNetworkSwitch, 
  isConnected 
}: NetworkSwitcherProps) {
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.id === currentNetworkId);

  const switchNetwork = async (network: Network) => {
    if (!isConnected || !window.ethereum) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first to switch networks.",
        variant: "destructive",
      });
      return;
    }

    if (network.id === currentNetworkId) {
      return; // Already on this network
    }

    setIsSwitching(true);

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });

      toast({
        title: "Network Switched",
        description: `Successfully switched to ${network.name}`,
      });

      // Call the callback to update app state
      if (onNetworkSwitch) {
        onNetworkSwitch(network.id);
      }

    } catch (switchError: any) {
      // If the network doesn't exist in wallet, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.nativeCurrency,
                symbol: network.nativeCurrency,
                decimals: 18,
              },
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls,
            }],
          });

          toast({
            title: "Network Added",
            description: `${network.name} has been added to your wallet`,
          });

          if (onNetworkSwitch) {
            onNetworkSwitch(network.id);
          }

        } catch (addError: any) {
          console.error('Error adding network:', addError);
          toast({
            title: "Failed to Add Network",
            description: addError.message || "Could not add network to wallet",
            variant: "destructive",
          });
        }
      } else {
        console.error('Error switching network:', switchError);
        toast({
          title: "Failed to Switch Network",
          description: switchError.message || "Could not switch to selected network",
          variant: "destructive",
        });
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Connect Wallet</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 px-3 py-2 h-auto border-border/50 hover:border-border transition-colors"
        >
          {currentNetwork ? (
            <>
              <div className={`w-3 h-3 rounded-full ${currentNetwork.color}`} />
              <span className="text-sm font-medium">{currentNetwork.shortName}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm font-medium">Unknown Network</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Select Network
          </div>
          {SUPPORTED_NETWORKS.map((network) => (
            <DropdownMenuItem
              key={network.id}
              className="flex items-center justify-between p-2 cursor-pointer rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => switchNetwork(network)}
              disabled={isSwitching}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${network.color} flex items-center justify-center`}>
                  <span className="text-xs text-white">{network.icon}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{network.shortName}</span>
                  <span className="text-xs text-muted-foreground">{network.nativeCurrency}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isSwitching && network.id !== currentNetworkId && (
                  <Zap className="w-3 h-3 text-primary animate-pulse" />
                )}
                {network.id === currentNetworkId && (
                  <Check className="w-4 h-4 text-success" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <div className="border-t border-border/50 p-2 mt-1">
          <div className="text-xs text-muted-foreground px-2">
            Switch between 7 supported networks
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}