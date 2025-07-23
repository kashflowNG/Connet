import { useState, useEffect, useCallback } from "react";
import { web3Service, type WalletState } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  networkId: null,
  networkName: null,
  provider: null,
};

export function useWeb3() {
  const [walletState, setWalletState] = useState<WalletState>(initialState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
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
  }, [toast]);

  const refreshBalance = useCallback(async () => {
    if (!walletState.address) return;

    try {
      const balance = await web3Service.getBalance(walletState.address);
      setWalletState(prev => ({ ...prev, balance }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Refresh Balance",
        description: error.message,
      });
    }
  }, [walletState.address, toast]);

  const transferAllFunds = useCallback(async (toAddress: string) => {
    if (!walletState.isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return null;
    }

    setIsTransferring(true);
    try {
      const txHash = await web3Service.transferAllFunds(toAddress);
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      // Refresh balance after transaction
      setTimeout(() => {
        refreshBalance();
      }, 2000);

      return txHash;
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
  }, [walletState.isConnected, toast, refreshBalance]);

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

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          // Ignore auto-connect errors
        }
      }
    };

    autoConnect();
  }, [connectWallet]);

  return {
    walletState,
    isConnecting,
    isTransferring,
    connectWallet,
    refreshBalance,
    transferAllFunds,
    getTransactionStatus,
  };
}
