// Enhanced wallet connection validation service
export class WalletValidator {
  private static instance: WalletValidator;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private lastValidationTime = 0;
  private validationCache: boolean = false;

  static getInstance(): WalletValidator {
    if (!WalletValidator.instance) {
      WalletValidator.instance = new WalletValidator();
    }
    return WalletValidator.instance;
  }

  // Fast wallet connection check with caching
  async isWalletConnected(address?: string): Promise<boolean> {
    const now = Date.now();
    
    // Use cache if recent (within 2 seconds)
    if (now - this.lastValidationTime < 2000) {
      return this.validationCache;
    }

    try {
      if (!window.ethereum) {
        this.validationCache = false;
        this.lastValidationTime = now;
        return false;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      
      if (!accounts || accounts.length === 0) {
        this.validationCache = false;
        this.lastValidationTime = now;
        return false;
      }

      // If specific address provided, verify it matches
      if (address && accounts[0] !== address) {
        this.validationCache = false;
        this.lastValidationTime = now;
        return false;
      }

      this.validationCache = true;
      this.lastValidationTime = now;
      return true;
    } catch (error) {
      console.warn('Wallet validation error:', error);
      this.validationCache = false;
      this.lastValidationTime = now;
      return false;
    }
  }

  // Start real-time monitoring
  startMonitoring(onConnectionChange: (isConnected: boolean) => void): void {
    this.stopMonitoring();
    
    this.connectionCheckInterval = setInterval(async () => {
      const isConnected = await this.isWalletConnected();
      onConnectionChange(isConnected);
    }, 3000); // Check every 3 seconds
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  // Clear cache for immediate revalidation
  invalidateCache(): void {
    this.lastValidationTime = 0;
    this.validationCache = false;
  }

  // Pre-transfer validation - comprehensive check
  async validateForTransfer(walletAddress: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      // Check if ethereum provider exists
      if (!window.ethereum) {
        return {
          isValid: false,
          error: "No wallet detected. Please install a Web3 wallet like MetaMask."
        };
      }

      // Check if accounts are accessible
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0) {
        return {
          isValid: false,
          error: "Wallet not connected. Please connect your wallet first."
        };
      }

      // Verify the expected account is still connected
      if (accounts[0] !== walletAddress) {
        return {
          isValid: false,
          error: "Connected wallet address has changed. Please reconnect."
        };
      }

      // Check network connectivity by getting the network
      const provider = new (await import('ethers')).ethers.BrowserProvider(window.ethereum);
      await provider.getNetwork();

      return { isValid: true };
    } catch (error: any) {
      return {
        isValid: false,
        error: `Connection error: ${error.message || 'Unknown error'}`
      };
    }
  }
}

export const walletValidator = WalletValidator.getInstance();