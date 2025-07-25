import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import type { WalletState } from "@/lib/web3";

interface WalletStatusProps {
  walletState: WalletState;
}

export default function WalletStatus({ walletState }: WalletStatusProps) {
  const { refreshBalance } = useWeb3();

  if (!walletState.isConnected) {
    return (
      <div className="mb-8">
        <Card className="bg-card/50 border-border ethereum-glass">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 ethereum-pulse">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground">Connect your Web3 wallet to view balance and transfer funds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <Card className="bg-card/50 border-border ethereum-glass">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wallet Status
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              className="text-muted-foreground hover:text-accent hover:bg-muted/50 ethereum-pulse"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 ethereum-glow">
              <div className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</div>
              <div className="text-sm font-mono text-foreground break-all">
                {walletState.address}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 ethereum-glow">
              <div className="text-sm font-medium text-muted-foreground mb-1">Network</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-foreground">
                  {walletState.networkName || "Unknown Network"}
                </span>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 ethereum-glow">
              <div className="text-sm font-medium text-muted-foreground mb-1">Portfolio Value</div>
              <div className="text-sm font-bold text-accent">
                {walletState.totalUsdValue.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 ethereum-glow">
              <div className="text-sm font-medium text-muted-foreground mb-1">Active Tokens</div>
              <div className="text-sm text-primary font-semibold">
                ETH + {walletState.tokenBalances.length} ERC-20 tokens
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
