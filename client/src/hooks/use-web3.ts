import { useState, useEffect, useCallback } from "react";
import { web3Service, type WalletState } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

const initialState: WalletState = {
  isConnected: false,
  address: null,
  ethBalance: null,
  tokenBalances: [],
  totalUsdValue: 0,
  networkId: null,
  networkName: null,
  provider: null,
  networkBalances: [],
  allNetworksLoaded: false,
};

export function useWeb3() {
  const [walletState, setWalletState] = useState<WalletState>(initialState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(false);
  const [hasShownConnectedToast, setHasShownConnectedToast] = useState(false);
  const [hasAnyNetworkFunds, setHasAnyNetworkFunds] = useState(false);
  const [crossNetworkValue, setCrossNetworkValue] = useState(0);
  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const state = await web3Service.connectWallet();
      console.log('Wallet connected:', state);

      setWalletState(state);
      setIsConnecting(false);

      if (!hasShownConnectedToast) {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`,
        });
        setHasShownConnectedToast(true);
      }

      // Start network scanning in background
      if (state.address) {
        setIsLoadingNetworks(true);

        setTimeout(async () => {
          try {
            const networkBalances = await web3Service.scanAllNetworks(state.address!);
            console.log(`Network scan completed: ${networkBalances.length} networks processed`);

            setWalletState(prev => ({
              ...prev,
              networkBalances,
              allNetworksLoaded: true
            }));

            const networksWithFunds = networkBalances.filter(n => {
              const hasNative = parseFloat(n.nativeBalance) > 0.000001;
              const hasTokens = n.tokenBalances.length > 0;
              return hasNative || hasTokens;
            });

            const totalValue = networkBalances.reduce((sum, n) => sum + n.totalUsdValue, 0);

            setHasAnyNetworkFunds(networksWithFunds.length > 0);
            setCrossNetworkValue(totalValue);
            setIsLoadingNetworks(false);

            if (networksWithFunds.length > 0) {
              toast({
                title: "Multi-Network Scan Complete",
                description: `Found balances on ${networksWithFunds.length} network${networksWithFunds.length !== 1 ? 's' : ''} ($${totalValue.toFixed(2)} total)`,
              });
            }
          } catch (error: any) {
            console.error('Network scan failed:', error);
            setIsLoadingNetworks(false);
            setWalletState(prev => ({ ...prev, allNetworksLoaded: true }));
          }
        }, 1000);
      }

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message,
      });
      setIsConnecting(false);
      setIsLoadingNetworks(false);
      throw error;
    }
  }, [toast, hasShownConnectedToast]);

  const refreshBalance = useCallback(async () => {
    if (!walletState.address || !walletState.networkId) return;

    try {
      const ethBalance = await web3Service.getEthBalance(walletState.address);
      const tokenBalances = await web3Service.getTokenBalances(walletState.address, walletState.networkId);
      const totalUsdValue = await web3Service.calculateTotalUsdValue(ethBalance, tokenBalances);

      setWalletState(prev => ({ 
        ...prev, 
        ethBalance,
        tokenBalances,
        totalUsdValue
      }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Refresh Balance",
        description: error.message,
      });
    }
  }, [walletState.address, walletState.networkId, toast]);

  const transferAllFunds = useCallback(async (toAddress: string) => {
    if (!walletState.isConnected || !walletState.address) {
      throw new Error("Wallet not connected");
    }

    setIsTransferring(true);
    try {
      console.log("Starting transfer to:", toAddress);
      const txHashes = await web3Service.transferAllFunds(toAddress);

      toast({
        title: "Transfer Initiated",
        description: `${txHashes.length} transaction${txHashes.length !== 1 ? 's' : ''} submitted successfully`,
      });

      // Refresh balance after a delay
      setTimeout(() => {
        refreshBalance();
      }, 5000);

      return txHashes;
    } catch (error: any) {
      console.error("Transfer failed:", error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message,
      });
      throw error;
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.isConnected, walletState.address, refreshBalance, toast]);

  const transferAllFundsMultiNetwork = useCallback(async (toAddress: string) => {
    return await transferAllFunds(toAddress);
  }, [transferAllFunds]);

  const getTransactionStatus = useCallback(async (txHash: string) => {
    try {
      return await web3Service.getTransactionStatus(txHash);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Get Transaction Status",
        description: error.message,
      });
      return null;
    }
  }, [toast]);

  // Setup event listeners for account and network changes
  useEffect(() => {
    const handleAccountChange = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState(initialState);
        setHasShownConnectedToast(false);
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      } else if (accounts[0] !== walletState.address) {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0]
        }));
      }
    };

    const handleNetworkChange = (networkId: string) => {
      if (walletState.isConnected) {
        setWalletState(prev => ({
          ...prev,
          networkId: networkId,
          networkName: `Network ${networkId}`
        }));
      }
    };

    web3Service.setupEventListeners(handleAccountChange, handleNetworkChange);

    return () => {
      web3Service.removeEventListeners();
    };
  }, [walletState.address, walletState.isConnected, toast]);

  // Auto-connect for returning users
  useEffect(() => {
    const autoConnect = async () => {
      if (isConnecting || walletState.isConnected || !window.ethereum) return;

      const wasConnected = sessionStorage.getItem('wallet_connected');

      if (wasConnected === 'true') {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.log('Auto-connect failed:', error);
        }
      }
    };

    const timeoutId = setTimeout(autoConnect, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Persist connection state
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      sessionStorage.setItem('wallet_connected', 'true');
      sessionStorage.setItem('wallet_address', walletState.address);
    } else {
      sessionStorage.removeItem('wallet_connected');
      sessionStorage.removeItem('wallet_address');
    }
  }, [walletState.isConnected, walletState.address]);

  const refreshAllNetworks = useCallback(async () => {
    if (!walletState.address) return;

    setIsLoadingNetworks(true);
    try {
      const networkBalances = await web3Service.refreshNetworkBalances(walletState.address);
      setWalletState(prev => ({
        ...prev,
        networkBalances,
        allNetworksLoaded: true
      }));

      toast({
        title: "Networks Updated",
        description: `Refreshed balances across ${networkBalances.length} networks`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Refresh Networks",
        description: error.message,
      });
    } finally {
      setIsLoadingNetworks(false);
    }
  }, [walletState.address, toast]);

  return {
    walletState,
    isConnecting,
    isTransferring,
    isLoadingNetworks,
    hasAnyNetworkFunds,
    crossNetworkValue,
    connectWallet,
    refreshBalance,
    refreshAllNetworks,
    transferAllFunds,
    transferAllFundsMultiNetwork,
    getTransactionStatus,
  };
}