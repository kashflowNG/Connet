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

    // Detect installed wallets
    const detectedWallets: string[] = [];
    if (hasEthereum) {
      const ethereum = (window as any).ethereum;
      if (ethereum.isMetaMask) detectedWallets.push('metamask');
      if (ethereum.isTrust) detectedWallets.push('trust');
      if (ethereum.isCoinbaseWallet) detectedWallets.push('coinbase');
      if (ethereum.isRainbow) detectedWallets.push('rainbow');
    }

    return {
      isMobile,
      isDesktop: !isMobile,
      browser,
      hasEthereum,
      detectedWallets,
    };
  }

  static generateWalletOptions(): WalletOption[] {
    const env = this.detectEnvironment();
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const host = window.location.host;
    const path = window.location.pathname;

    return [
      {
        id: 'metamask-extension',
        name: 'MetaMask Browser Extension',
        description: 'Connect using MetaMask browser extension',
        icon: '🦊',
        available: env.isDesktop,
        installed: env.detectedWallets.includes('metamask'),
        installUrl: 'https://metamask.io/download/',
      },
      {
        id: 'metamask-mobile',
        name: 'MetaMask Mobile',
        description: 'Open in MetaMask mobile app',
        icon: '📱',
        available: true,
        installed: false,
        deepLink: `https://metamask.app.link/dapp/${host}${path}`,
      },
      {
        id: 'trust-wallet',
        name: 'Trust Wallet',
        description: 'Open in Trust Wallet app',
        icon: '🛡️',
        available: true,
        installed: env.detectedWallets.includes('trust'),
        deepLink: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
      },
      {
        id: 'rainbow',
        name: 'Rainbow Wallet',
        description: 'Open in Rainbow wallet app',
        icon: '🌈',
        available: true,
        installed: env.detectedWallets.includes('rainbow'),
        deepLink: `https://rnbwapp.com/to/${encodedUrl}`,
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        description: 'Open in Coinbase Wallet app',
        icon: '💙',
        available: true,
        installed: env.detectedWallets.includes('coinbase'),
        deepLink: `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
      }
    ];
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
    return new Promise((resolve) => {
      // Check if wallet is available
      if ((window as any).ethereum) {
        resolve(true);
        return;
      }

      // Wait for wallet injection (some wallets inject asynchronously)
      let attempts = 0;
      const maxAttempts = 20;
      const checkInterval = setInterval(() => {
        attempts++;
        if ((window as any).ethereum || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(!!(window as any).ethereum);
        }
      }, 200);
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
}