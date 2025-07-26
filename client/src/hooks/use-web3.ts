
import { useState, useEffect, useCallback } from "react";
import { web3Service, type WalletState } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { WalletDetector } from "@/lib/wallet-detector";

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

      // Mark successful connection for future auto-connect
      WalletDetector.markSuccessfulConnection();
      
      // Start network scanning in background after connection
      if (state.address) {
        setIsLoadingNetworks(true);
        console.log('Starting multi-network scan...');
        
        const startNetworkScan = async () => {
          try {
            const networkBalances = await web3Service.scanAllNetworks(state.address!);
            console.log(`Network scan completed: ${networkBalances.length} networks processed`);
            
            setWalletState(prev => ({
              ...prev,
              networkBalances,
              allNetworksLoaded: true
            }));
            
            const networksWithFunds = networkBalances.filter(n => {
              const hasNativeBalance = parseFloat(n.nativeBalance) > 0.000001;
              const hasTokenBalance = n.tokenBalances.some(token => parseFloat(token.balance) > 0.000001);
              const hasUsdValue = n.totalUsdValue > 0.001;
              return hasNativeBalance || hasTokenBalance || hasUsdValue;
            });
            
            const hasAnyFunds = networksWithFunds.length > 0;
            const totalValue = networkBalances.reduce((sum, n) => sum + n.totalUsdValue, 0);
            const hasAnyTokens = networkBalances.some(n => n.tokenBalances.length > 0);
            const hasNetworkData = networkBalances.length > 0;
            const finalHasFunds = hasAnyFunds || hasAnyTokens || hasNetworkData;
            
            setHasAnyNetworkFunds(finalHasFunds);
            setCrossNetworkValue(totalValue);
            setIsLoadingNetworks(false);
            
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
            setWalletState(prev => ({ ...prev, allNetworksLoaded: true }));
            setIsLoadingNetworks(false);
            
            toast({
              variant: "destructive",
              title: "Network Scan Failed",
              description: "Unable to scan all networks. Some balances may not be displayed.",
            });
          }
        };
        
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
    if (!walletState.isConnected || !walletState.address || !window.ethereum) {
      return null;
    }

    setIsTransferring(true);
    try {
      const txHashes = await web3Service.transferAllFunds(toAddress);
      
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

  // Enhanced event listeners for account and network changes
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
        setWalletState(prev => ({ ...prev, address: accounts[0] }));
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

  // Enhanced auto-connection with better wallet detection
  useEffect(() => {
    const attemptAutoConnection = async () => {
      // Skip if already connecting or connected
      if (isConnecting || walletState.isConnected) return;
      
      console.log('🔄 Checking for auto-connection opportunity...');

      // Check for pending connection attempt
      const connectionAttempt = WalletDetector.checkConnectionAttempt();
      if (connectionAttempt) {
        console.log('📱 Found pending wallet connection attempt');
        WalletDetector.clearConnectionAttempt();
        
        // Wait a bit for wallet to be ready
        setTimeout(async () => {
          const isAvailable = await WalletDetector.checkWalletAvailability();
          if (isAvailable) {
            console.log('✅ Wallet became available, connecting...');
            try {
              await connectWallet();
            } catch (error) {
              console.log('❌ Auto-connection after return failed:', error);
            }
          }
        }, 1000);
        return;
      }

      // Try automatic connection for returning users
      try {
        const autoConnected = await WalletDetector.attemptAutoConnect();
        if (autoConnected) {
          console.log('🎯 Auto-connection successful, connecting wallet...');
          await connectWallet();
        }
      } catch (error) {
        console.log('❌ Auto-connection failed:', error);
      }
    };

    // Small delay to allow page to load
    const timeoutId = setTimeout(attemptAutoConnection, 200);
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array to run only once

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
    console.log("Starting simple current network transfer");
    
    if (!walletState.isConnected || !walletState.address || !window.ethereum) {
      throw new Error("Wallet not connected");
    }

    setIsTransferring(true);
    try {
      const result = await web3Service.transferCurrentNetworkFunds(toAddress);
      console.log("Transfer completed:", result);
      
      setTimeout(() => {
        refreshBalance();
      }, 3000);

      return result;
    } catch (error: any) {
      console.error("Transfer failed:", error);
      throw error;
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.isConnected, walletState.address, refreshBalance]);

  const switchNetwork = useCallback(async (networkId: string) => {
    try {
      setIsConnecting(true);
      const newState = await web3Service.switchNetwork(networkId);
      setWalletState(newState);
      
      if (newState.address) {
        refreshAllNetworks();
      }
    } catch (error: any) {
      console.error('Network switch failed:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshAllNetworks]);

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
    switchNetwork,
  };
}
