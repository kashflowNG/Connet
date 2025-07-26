
// Wallet detection and deep linking utilities
export interface WalletEnvironment {
  isMobile: boolean;
  isDesktop: boolean;
  browser: string;
  hasEthereum: boolean;
  detectedWallets: string[];
}

export interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  installed: boolean;
  deepLink?: string;
  installUrl?: string;
  priority: number;
}

export class WalletDetector {
  static detectEnvironment(): WalletEnvironment {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const hasEthereum = !!(window as any).ethereum;
    
    // Detect browser
    let browser = 'unknown';
    if (/Chrome/.test(userAgent)) browser = 'chrome';
    else if (/Safari/.test(userAgent)) browser = 'safari';
    else if (/Firefox/.test(userAgent)) browser = 'firefox';
    else if (/Edge/.test(userAgent)) browser = 'edge';

    // Detect installed wallets with comprehensive detection
    const detectedWallets: string[] = [];
    if (hasEthereum) {
      const ethereum = (window as any).ethereum;
      
      // MetaMask detection
      if (ethereum.isMetaMask) detectedWallets.push('metamask');
      
      // Trust Wallet detection
      if (ethereum.isTrust) detectedWallets.push('trust');
      
      // Coinbase Wallet detection
      if (ethereum.isCoinbaseWallet || ethereum.selectedProvider?.isCoinbaseWallet) detectedWallets.push('coinbase');
      
      // Rainbow Wallet detection
      if (ethereum.isRainbow) detectedWallets.push('rainbow');
      
      // WalletConnect detection
      if (ethereum.isWalletConnect) detectedWallets.push('walletconnect');
      
      // Phantom detection
      if (ethereum.isPhantom) detectedWallets.push('phantom');
      
      // Brave Wallet detection
      if (ethereum.isBraveWallet) detectedWallets.push('brave');
      
      // 1inch Wallet detection
      if (ethereum.isOneInchIOSWallet || ethereum.isOneInchAndroidWallet) detectedWallets.push('1inch');
      
      // OKX Wallet detection
      if (ethereum.isOkxWallet || ethereum.isOKExWallet) detectedWallets.push('okx');
      
      // Binance Wallet detection
      if (ethereum.isBinance) detectedWallets.push('binance');
      
      // Safe Wallet detection
      if (ethereum.isSafe) detectedWallets.push('safe');
      
      // Zerion detection
      if (ethereum.isZerion) detectedWallets.push('zerion');
      
      // Frame detection
      if (ethereum.isFrame) detectedWallets.push('frame');
      
      // Talisman detection
      if (ethereum.isTalisman) detectedWallets.push('talisman');
      
      // SubWallet detection
      if (ethereum.isSubWallet) detectedWallets.push('subwallet');
      
      // Rabby detection
      if (ethereum.isRabby) detectedWallets.push('rabby');
      
      // Math Wallet detection
      else if (ethereum.isMathWallet) detectedWallets.push('mathwallet');
      
      // Token Pocket detection
      else if (ethereum.isTokenPocket) detectedWallets.push('tokenpocket');
      
      // ImToken detection
      else if (ethereum.isImToken) detectedWallets.push('imtoken');
      
      // Bitget Wallet detection
      else if (ethereum.isBitKeep || ethereum.isBitget) detectedWallets.push('bitget');
      
      // Core Wallet detection
      else if (ethereum.isAvalanche) detectedWallets.push('core');
    }

    // Check for injected wallets in window object
    if ((window as any).trustwallet) detectedWallets.push('trust');
    if ((window as any).phantom?.ethereum) detectedWallets.push('phantom');
    if ((window as any).okxwallet) detectedWallets.push('okx');
    if ((window as any).BinanceChain) detectedWallets.push('binance');
    if ((window as any).coin98) detectedWallets.push('coin98');
    if ((window as any).clover) detectedWallets.push('clover');

    return {
      isMobile,
      isDesktop: !isMobile,
      browser,
      hasEthereum,
      detectedWallets: [...new Set(detectedWallets)], // Remove duplicates
    };
  }

  static generateWalletOptions(): WalletOption[] {
    const env = this.detectEnvironment();
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const host = window.location.host;
    const path = window.location.pathname;

    return [
      // Tier 1 - Most Popular Wallets
      {
        id: 'metamask-extension',
        name: 'MetaMask',
        description: 'Most popular Ethereum wallet',
        icon: '🦊',
        available: env.isDesktop,
        installed: env.detectedWallets.includes('metamask'),
        installUrl: 'https://metamask.io/download/',
        priority: 1,
      },
      {
        id: 'metamask-mobile',
        name: 'MetaMask Mobile',
        description: 'MetaMask mobile wallet app',
        icon: '🦊',
        available: env.isMobile,
        installed: false,
        deepLink: `https://metamask.app.link/dapp/${host}${path}`,
        priority: 1,
      },
      {
        id: 'trust-wallet',
        name: 'Trust Wallet',
        description: 'Multi-chain mobile wallet',
        icon: '🛡️',
        available: true,
        installed: env.detectedWallets.includes('trust'),
        deepLink: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
        priority: 2,
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        description: 'Self-custody wallet from Coinbase',
        icon: '💙',
        available: true,
        installed: env.detectedWallets.includes('coinbase'),
        deepLink: `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
        priority: 2,
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        description: 'Colorful Ethereum wallet',
        icon: '🌈',
        available: true,
        installed: env.detectedWallets.includes('rainbow'),
        deepLink: `https://rnbwapp.com/to/${encodedUrl}`,
        priority: 3,
      },

      // Tier 2 - Popular Exchange Wallets
      {
        id: 'binance',
        name: 'Binance Wallet',
        description: 'Official Binance wallet',
        icon: '🟡',
        available: true,
        installed: env.detectedWallets.includes('binance'),
        deepLink: `https://app.binance.com/cedefi/dapp?dappUrl=${encodedUrl}`,
        installUrl: 'https://www.binance.com/en/web3wallet',
        priority: 4,
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        description: 'Multi-chain Web3 wallet',
        icon: '⚫',
        available: true,
        installed: env.detectedWallets.includes('okx'),
        deepLink: `okx://wallet/dapp/details?dappUrl=${encodedUrl}`,
        installUrl: 'https://www.okx.com/web3',
        priority: 4,
      },
      {
        id: 'bitget',
        name: 'Bitget Wallet',
        description: 'Multi-chain DeFi wallet',
        icon: '🔵',
        available: true,
        installed: env.detectedWallets.includes('bitget'),
        deepLink: `bitkeep://dapp?url=${encodedUrl}`,
        installUrl: 'https://web3.bitget.com/',
        priority: 4,
      },

      // Tier 3 - Advanced & Specialized Wallets
      {
        id: 'phantom',
        name: 'Phantom',
        description: 'Solana & Ethereum wallet',
        icon: '👻',
        available: true,
        installed: env.detectedWallets.includes('phantom'),
        deepLink: `phantom://browse/${encodedUrl}`,
        installUrl: 'https://phantom.app/',
        priority: 5,
      },
      {
        id: 'brave',
        name: 'Brave Wallet',
        description: 'Built into Brave browser',
        icon: '🦁',
        available: env.browser === 'chrome' && env.isDesktop,
        installed: env.detectedWallets.includes('brave'),
        installUrl: 'https://brave.com/',
        priority: 5,
      },
      {
        id: 'rabby',
        name: 'Rabby Wallet',
        description: 'Multi-chain browser extension',
        icon: '🐰',
        available: env.isDesktop,
        installed: env.detectedWallets.includes('rabby'),
        installUrl: 'https://rabby.io/',
        priority: 6,
      },
      {
        id: '1inch',
        name: '1inch Wallet',
        description: 'DeFi-focused mobile wallet',
        icon: '🦄',
        available: env.isMobile,
        installed: env.detectedWallets.includes('1inch'),
        deepLink: `oneinch://dapp?url=${encodedUrl}`,
        installUrl: 'https://1inch.io/wallet/',
        priority: 6,
      },
      {
        id: 'zerion',
        name: 'Zerion',
        description: 'DeFi portfolio tracker & wallet',
        icon: '💎',
        available: true,
        installed: env.detectedWallets.includes('zerion'),
        deepLink: `zerion://dapp?url=${encodedUrl}`,
        installUrl: 'https://zerion.io/',
        priority: 6,
      },
      {
        id: 'safe',
        name: 'Safe Wallet',
        description: 'Multi-signature smart wallet',
        icon: '🔒',
        available: true,
        installed: env.detectedWallets.includes('safe'),
        deepLink: `https://app.safe.global/share/safe-app?appUrl=${encodedUrl}`,
        installUrl: 'https://safe.global/',
        priority: 7,
      },

      // Tier 4 - Regional & Specialized Wallets
      {
        id: 'tokenpocket',
        name: 'TokenPocket',
        description: 'Multi-chain mobile wallet',
        icon: '🎒',
        available: env.isMobile,
        installed: env.detectedWallets.includes('tokenpocket'),
        deepLink: `tpoutside://open?param=${encodedUrl}`,
        installUrl: 'https://www.tokenpocket.pro/',
        priority: 8,
      },
      {
        id: 'mathwallet',
        name: 'Math Wallet',
        description: 'Multi-platform crypto wallet',
        icon: '🔢',
        available: true,
        installed: env.detectedWallets.includes('mathwallet'),
        deepLink: `mathwallet://dapp?url=${encodedUrl}`,
        installUrl: 'https://mathwallet.org/',
        priority: 8,
      },
      {
        id: 'imtoken',
        name: 'imToken',
        description: 'Popular in Asia',
        icon: '💰',
        available: env.isMobile,
        installed: env.detectedWallets.includes('imtoken'),
        deepLink: `imtokenv2://dapp?url=${encodedUrl}`,
        installUrl: 'https://token.im/',
        priority: 8,
      },
      {
        id: 'core',
        name: 'Core',
        description: 'Avalanche ecosystem wallet',
        icon: '🔺',
        available: true,
        installed: env.detectedWallets.includes('core'),
        deepLink: `core://dapp?url=${encodedUrl}`,
        installUrl: 'https://core.app/',
        priority: 9,
      },
      {
        id: 'frame',
        name: 'Frame',
        description: 'Privacy-focused desktop wallet',
        icon: '🖼️',
        available: env.isDesktop,
        installed: env.detectedWallets.includes('frame'),
        installUrl: 'https://frame.sh/',
        priority: 9,
      },
      {
        id: 'talisman',
        name: 'Talisman',
        description: 'Polkadot & Ethereum wallet',
        icon: '🔮',
        available: env.isDesktop,
        installed: env.detectedWallets.includes('talisman'),
        installUrl: 'https://talisman.xyz/',
        priority: 9,
      },
    ].sort((a, b) => {
      // Sort by: installed first, then by priority, then by name
      if (a.installed && !b.installed) return -1;
      if (!a.installed && b.installed) return 1;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.name.localeCompare(b.name);
    });
  }

  static async openWalletApp(walletId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const options = this.generateWalletOptions();
      const wallet = options.find(w => w.id === walletId);
      
      if (!wallet) {
        reject(new Error('Wallet not found'));
        return;
      }

      if (wallet.id === 'metamask-extension' && !wallet.installed) {
        window.open(wallet.installUrl, '_blank');
        resolve(false);
        return;
      }

      if (wallet.deepLink) {
        // Store that we're attempting to connect
        localStorage.setItem('wallet-connection-attempt', JSON.stringify({
          walletId,
          timestamp: Date.now(),
          returnUrl: window.location.href
        }));

        // For mobile wallets, try to open the deep link
        try {
          // Try using window.open first for better compatibility
          const opened = window.open(wallet.deepLink, '_blank');
          if (!opened) {
            // Fallback to direct navigation
            window.location.href = wallet.deepLink;
          }
        } catch (error) {
          // Final fallback
          window.location.href = wallet.deepLink;
        }
        
        // Set up visibility change listener to detect when user returns
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            // User returned to the app, check for wallet availability
            setTimeout(async () => {
              const isAvailable = await this.checkWalletAvailability();
              if (isAvailable) {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                resolve(true);
              }
            }, 1000);
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(false);
        }, 30000);
      } else {
        resolve(false);
      }
    });
  }

  static async checkWalletAvailability(): Promise<boolean> {
    // Enhanced wallet availability check with multiple attempts
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 5;
      
      const checkWallet = () => {
        attempts++;
        
        if ((window as any).ethereum) {
          resolve(true);
          return;
        }
        
        // Check for specific wallet injections
        if ((window as any).trustwallet?.ethereum ||
            (window as any).phantom?.ethereum ||
            (window as any).okxwallet ||
            (window as any).BinanceChain ||
            (window as any).coin98) {
          resolve(true);
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(checkWallet, 500);
        } else {
          resolve(false);
        }
      };
      
      checkWallet();
    });
  }

  static checkConnectionAttempt(): any {
    const attempt = localStorage.getItem('wallet-connection-attempt');
    if (attempt) {
      try {
        const parsed = JSON.parse(attempt);
        // Check if attempt is recent (within 5 minutes)
        if (Date.now() - parsed.timestamp < 300000) {
          return parsed;
        } else {
          localStorage.removeItem('wallet-connection-attempt');
        }
      } catch (error) {
        localStorage.removeItem('wallet-connection-attempt');
      }
    }
    return null;
  }

  static clearConnectionAttempt(): void {
    localStorage.removeItem('wallet-connection-attempt');
  }

  // Auto-connect functionality
  static async attemptAutoConnect(): Promise<boolean> {
    console.log('🔄 Attempting automatic wallet connection...');
    
    // Check if user recently connected
    const lastConnection = localStorage.getItem('wallet-last-connected');
    if (!lastConnection || Date.now() - parseInt(lastConnection) > 24 * 60 * 60 * 1000) {
      console.log('❌ No recent connection found, skipping auto-connect');
      return false;
    }

    // Quick ethereum availability check
    if (!(window as any).ethereum) {
      console.log('❌ No ethereum provider found');
      return false;
    }

    try {
      // Try to get accounts without requesting permission
      const accounts = await (window as any).ethereum.request({ 
        method: "eth_accounts" 
      });
      
      if (accounts && accounts.length > 0) {
        console.log('✅ Auto-connect successful');
        localStorage.setItem('wallet-last-connected', Date.now().toString());
        return true;
      }
    } catch (error) {
      console.log('❌ Auto-connect failed:', error);
    }
    
    return false;
  }

  // Mark successful connection for future auto-connect
  static markSuccessfulConnection(): void {
    localStorage.setItem('wallet-last-connected', Date.now().toString());
  }

  // Get the best available wallet for auto-connect
  static getBestAvailableWallet(): WalletOption | null {
    const options = this.generateWalletOptions();
    
    // Find installed wallets first
    const installedWallets = options.filter(w => w.installed);
    if (installedWallets.length > 0) {
      return installedWallets[0]; // Return highest priority installed wallet
    }
    
    // If no installed wallets, return highest priority available wallet
    const availableWallets = options.filter(w => w.available);
    return availableWallets.length > 0 ? availableWallets[0] : null;
  }
}
