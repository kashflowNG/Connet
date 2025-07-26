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
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  available: boolean;
  installed: boolean;
  deepLink?: string;
  installUrl?: string;
  priority?: number; // Higher priority wallets shown first
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

    // Enhanced wallet detection
    const detectedWallets: string[] = [];
    if (hasEthereum) {
      const ethereum = (window as any).ethereum;
      
      // Check for specific wallet providers
      if (ethereum.isMetaMask) detectedWallets.push('metamask');
      if (ethereum.isTrust) detectedWallets.push('trust');
      if (ethereum.isCoinbaseWallet || ethereum.coinbaseWalletExtension) detectedWallets.push('coinbase');
      if (ethereum.isRainbow) detectedWallets.push('rainbow');
      
      // Enhanced mobile wallet detection
      if (isMobile && hasEthereum) {
        // On mobile, if ethereum is available, user is likely in a wallet browser
        // Check URL or user agent for specific wallet indicators
        const currentUrl = window.location.href.toLowerCase();
        const userAgentLower = userAgent.toLowerCase();
        
        // Check for wallet-specific user agents or URL patterns
        if (userAgentLower.includes('trust') || currentUrl.includes('trust') || ethereum.isTrust) {
          if (!detectedWallets.includes('trust')) detectedWallets.push('trust');
        }
        if (userAgentLower.includes('metamask') || currentUrl.includes('metamask') || ethereum.isMetaMask) {
          if (!detectedWallets.includes('metamask')) detectedWallets.push('metamask');
        }
        if (userAgentLower.includes('rainbow') || currentUrl.includes('rainbow') || ethereum.isRainbow) {
          if (!detectedWallets.includes('rainbow')) detectedWallets.push('rainbow');
        }
        if (userAgentLower.includes('coinbase') || currentUrl.includes('coinbase') || ethereum.isCoinbaseWallet) {
          if (!detectedWallets.includes('coinbase')) detectedWallets.push('coinbase');
        }
        
        // If no specific wallet detected but ethereum exists, check for common mobile wallets
        if (detectedWallets.length === 0) {
          // Generic detection - if ethereum exists on mobile, likely from a wallet
          detectedWallets.push('generic-mobile-wallet');
        }
      }
    }

    // Check for other wallet providers
    if ((window as any).phantom?.ethereum) detectedWallets.push('phantom');
    if ((window as any).safepal) detectedWallets.push('safepal');
    if ((window as any).exodus) detectedWallets.push('exodus');

    return {
      isMobile,
      isDesktop: !isMobile,
      browser,
      hasEthereum,
      detectedWallets,
    };
  }

  static generateWalletOptions(): Omit<WalletOption, 'icon' | 'color'>[] {
    const env = this.detectEnvironment();
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const host = window.location.host;
    const path = window.location.pathname;

    const walletOptions = [
      // MetaMask - Most popular wallet
      {
        id: 'metamask-extension',
        name: 'MetaMask',
        description: 'Most popular Ethereum wallet',
        available: env.isDesktop,
        installed: env.detectedWallets.includes('metamask'),
        installUrl: 'https://metamask.io/download/',
        priority: 10,
      },
      {
        id: 'metamask-mobile',
        name: 'MetaMask Mobile',
        description: 'MetaMask mobile app',
        available: env.isMobile,
        installed: env.isMobile && (env.detectedWallets.includes('metamask') || (env.hasEthereum && env.detectedWallets.length > 0)),
        deepLink: `https://metamask.app.link/dapp/${host}${path}`,
        priority: 9,
      },

      // Coinbase Wallet - Very popular
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        description: 'Secure wallet by Coinbase',
        available: true,
        installed: env.detectedWallets.includes('coinbase'),
        deepLink: `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
        priority: 8,
      },

      // Trust Wallet - Popular mobile wallet
      {
        id: 'trust-wallet',
        name: 'Trust Wallet',
        description: 'Multi-cryptocurrency mobile wallet',
        available: true,
        installed: env.detectedWallets.includes('trust'),
        deepLink: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
        priority: 7,
      },

      // Rainbow Wallet - Popular DeFi wallet
      {
        id: 'rainbow',
        name: 'Rainbow Wallet',
        description: 'Beautiful Ethereum wallet',
        available: true,
        installed: env.detectedWallets.includes('rainbow'),
        deepLink: `https://rnbwapp.com/to/${encodedUrl}`,
        priority: 6,
      },

      // WalletConnect - Universal connection
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        description: 'Connect 100+ wallets via WalletConnect',
        available: true,
        installed: false,
        priority: 5,
      },

      // Phantom - Popular Solana/Ethereum wallet
      {
        id: 'phantom',
        name: 'Phantom Wallet',
        description: 'Multi-chain wallet for Solana & Ethereum',
        available: true,
        installed: this.checkPhantomInstalled(),
        deepLink: env.isMobile ? `https://phantom.app/ul/browse/${encodedUrl}` : undefined,
        installUrl: 'https://phantom.app/',
        priority: 4,
      },

      // SafePal - Hardware + software wallet
      {
        id: 'safepal',
        name: 'SafePal Wallet',
        description: 'Hardware & software crypto wallet',
        available: true,
        installed: this.checkSafePalInstalled(),
        deepLink: env.isMobile ? `safepalwallet://dapp?url=${encodedUrl}` : undefined,
        installUrl: 'https://safepal.io/',
        priority: 3,
      },

      // Exodus - Popular multi-currency wallet
      {
        id: 'exodus',
        name: 'Exodus Wallet',
        description: 'Multi-currency wallet with built-in exchange',
        available: true,
        installed: this.checkExodusInstalled(),
        installUrl: 'https://exodus.com/',
        priority: 2,
      },

      // Hardware wallets - Most secure
      {
        id: 'ledger',
        name: 'Ledger Hardware',
        description: 'Hardware wallet via Ledger Live',
        available: env.isDesktop,
        installed: false,
        installUrl: 'https://www.ledger.com/ledger-live',
        priority: 1,
      },
      {
        id: 'trezor',
        name: 'Trezor Hardware',
        description: 'Hardware wallet via Trezor Suite',
        available: env.isDesktop,
        installed: false,
        installUrl: 'https://suite.trezor.io/',
        priority: 0,
      }
    ];

    // Sort by priority (higher first) and then by availability
    return walletOptions
      .filter(wallet => wallet.available)
      .sort((a, b) => {
        if (a.installed !== b.installed) return a.installed ? -1 : 1;
        return (b.priority || 0) - (a.priority || 0);
      });
  }

  // Additional wallet detection methods
  static checkPhantomInstalled(): boolean {
    return !!(window as any).phantom?.ethereum;
  }

  static checkSafePalInstalled(): boolean {
    return !!(window as any).safepal;
  }

  static checkExodusInstalled(): boolean {
    return !!(window as any).exodus;
  }

  static openWalletApp(walletId: string): Promise<boolean> {
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

  static checkWalletAvailability(): Promise<boolean> {
    // Instant wallet availability check - no delays
    return Promise.resolve(!!(window as any).ethereum);
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
}