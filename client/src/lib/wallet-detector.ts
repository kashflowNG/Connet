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

  static openWalletApp(walletId: string): void {
    const options = this.generateWalletOptions();
    const wallet = options.find(w => w.id === walletId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.id === 'metamask-extension' && !wallet.installed) {
      window.open(wallet.installUrl, '_blank');
      return;
    }

    if (wallet.deepLink) {
      // For mobile wallets, try to open the deep link
      window.location.href = wallet.deepLink;
      
      // Fallback: if deep link doesn't work after 2 seconds, show manual instructions
      setTimeout(() => {
        const message = `If ${wallet.name} didn't open automatically, please:
1. Copy this URL: ${window.location.href}
2. Open ${wallet.name} app manually
3. Navigate to the Browser/DApp section
4. Paste the URL and visit`;
        
        if (confirm(message + '\n\nWould you like to copy the URL to clipboard?')) {
          navigator.clipboard.writeText(window.location.href).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          });
        }
      }, 2000);
    }
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
      const maxAttempts = 10;
      const checkInterval = setInterval(() => {
        attempts++;
        if ((window as any).ethereum || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(!!(window as any).ethereum);
        }
      }, 100);
    });
  }
}