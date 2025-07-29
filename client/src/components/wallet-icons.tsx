// Professional wallet icons as SVG components
export const WalletIcons = {
  MetaMask: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 318.6 318.6" className="rounded-md">
      <defs>
        <style>{`.cls-1{fill:#e2761b;stroke:#e2761b;stroke-linecap:round;stroke-linejoin:round;}.cls-2{fill:#e4761b;stroke:#e4761b;stroke-linecap:round;stroke-linejoin:round;}.cls-3{fill:#d7c1b3;stroke:#d7c1b3;stroke-linecap:round;stroke-linejoin:round;}.cls-4{fill:#233447;stroke:#233447;stroke-linecap:round;stroke-linejoin:round;}.cls-5{fill:#cd6116;stroke:#cd6116;stroke-linecap:round;stroke-linejoin:round;}.cls-6{fill:#e4751f;stroke:#e4751f;stroke-linecap:round;stroke-linejoin:round;}.cls-7{fill:#f6851b;stroke:#f6851b;stroke-linecap:round;stroke-linejoin:round;}.cls-8{fill:#c0ad9e;stroke:#c0ad9e;stroke-linecap:round;stroke-linejoin:round;}.cls-9{fill:#161616;stroke:#161616;stroke-linecap:round;stroke-linejoin:round;}.cls-10{fill:#763d16;stroke:#763d16;stroke-linecap:round;stroke-linejoin:round;}.cls-11{fill:#f5841f;stroke:#f5841f;stroke-linecap:round;stroke-linejoin:round;}`}</style>
      </defs>
      <polygon className="cls-1" points="274.1,35.5 174.6,109.4 193,65.8 274.1,35.5"/>
      <polygon className="cls-2" points="44.4,35.5 143.1,110.1 125.6,65.8 44.4,35.5"/>
      <polygon className="cls-2" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7 238.3,206.8"/>
      <polygon className="cls-2" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8 33.9,207.7"/>
      <polygon className="cls-2" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1 103.6,138.2"/>
      <polygon className="cls-2" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1 214.9,138.2"/>
      <polygon className="cls-7" points="106.8,247.4 140.6,230.9 111.4,208.1 106.8,247.4"/>
      <polygon className="cls-7" points="177.9,230.9 211.8,247.4 207.1,208.1 177.9,230.9"/>
    </svg>
  ),

  TrustWallet: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#3375BB'}}/>
          <stop offset="100%" style={{stopColor:'#1E5BB8'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#trustGradient)"/>
      <path d="M50 15 L75 25 L75 45 C75 60 65 72 50 85 C35 72 25 60 25 45 L25 25 Z" fill="white"/>
      <path d="M50 25 L65 32 L65 45 C65 55 58 63 50 70 C42 63 35 55 35 45 L35 32 Z" fill="#3375BB"/>
      <circle cx="45" cy="42" r="3" fill="white"/>
      <circle cx="55" cy="42" r="3" fill="white"/>
      <path d="M42 52 Q50 58 58 52" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),

  CoinbaseWallet: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="coinbaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#0052FF'}}/>
          <stop offset="100%" style={{stopColor:'#0041CC'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#coinbaseGradient)"/>
      <rect x="30" y="30" width="40" height="40" rx="8" fill="white"/>
      <rect x="40" y="45" width="20" height="4" fill="#0052FF"/>
      <rect x="48" y="37" width="4" height="20" fill="#0052FF"/>
    </svg>
  ),

  RainbowWallet: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#FF6B6B'}}/>
          <stop offset="25%" style={{stopColor:'#4ECDC4'}}/>
          <stop offset="50%" style={{stopColor:'#45B7D1'}}/>
          <stop offset="75%" style={{stopColor:'#96CEB4'}}/>
          <stop offset="100%" style={{stopColor:'#FFEAA7'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#rainbowGradient)"/>
      <path d="M20 70 Q30 40 50 50 Q70 40 80 70" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M25 65 Q35 50 50 55 Q65 50 75 65" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="50" cy="60" r="8" fill="white"/>
    </svg>
  ),

  WalletConnect: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="wcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#3B99FC'}}/>
          <stop offset="100%" style={{stopColor:'#1E5BB8'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#wcGradient)"/>
      <path d="M30 40 Q40 30 50 40 Q60 30 70 40 L65 50 Q50 35 35 50 Z" fill="white"/>
      <circle cx="42" cy="55" r="3" fill="white"/>
      <circle cx="58" cy="55" r="3" fill="white"/>
      <path d="M25 65 Q35 75 50 65 Q65 75 75 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  ),

  PhantomWallet: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="phantomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#AB9FF2'}}/>
          <stop offset="100%" style={{stopColor:'#7C3AED'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#phantomGradient)"/>
      <path d="M25 35 Q25 25 35 25 L65 25 Q75 25 75 35 L75 55 Q75 75 50 85 Q25 75 25 55 Z" fill="white"/>
      <circle cx="42" cy="45" r="4" fill="#7C3AED"/>
      <circle cx="58" cy="45" r="4" fill="#7C3AED"/>
      <path d="M40 60 Q50 70 60 60" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),

  SafePal: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="safepalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#4A90E2'}}/>
          <stop offset="100%" style={{stopColor:'#2E5C8A'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#safepalGradient)"/>
      <path d="M50 15 L75 30 L75 50 C75 65 65 75 50 85 C35 75 25 65 25 50 L25 30 Z" fill="white"/>
      <path d="M50 25 L65 35 L65 50 C65 60 58 67 50 72 C42 67 35 60 35 50 L35 35 Z" fill="#4A90E2"/>
      <rect x="45" y="45" width="10" height="15" rx="2" fill="white"/>
      <circle cx="50" cy="42" r="3" fill="white"/>
    </svg>
  ),

  Exodus: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="exodusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#7B68EE'}}/>
          <stop offset="100%" style={{stopColor:'#4B0082'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#exodusGradient)"/>
      <circle cx="50" cy="50" r="25" fill="white"/>
      <path d="M35 40 L50 25 L65 40 L60 45 L50 35 L40 45 Z" fill="#7B68EE"/>
      <path d="M35 60 L50 75 L65 60 L60 55 L50 65 L40 55 Z" fill="#7B68EE"/>
      <rect x="45" y="45" width="10" height="10" fill="#7B68EE"/>
    </svg>
  ),

  Ledger: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <rect width="100" height="100" rx="20" fill="#000000"/>
      <rect x="20" y="30" width="60" height="40" rx="5" fill="white"/>
      <rect x="25" y="35" width="50" height="30" rx="3" fill="#000000"/>
      <rect x="30" y="42" width="12" height="3" fill="white"/>
      <rect x="30" y="48" width="20" height="3" fill="white"/>
      <rect x="30" y="54" width="16" height="3" fill="white"/>
      <circle cx="70" cy="50" r="6" fill="white"/>
      <circle cx="70" cy="50" r="3" fill="#000000"/>
    </svg>
  ),

  Trezor: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-md">
      <defs>
        <linearGradient id="trezorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#00B65A'}}/>
          <stop offset="100%" style={{stopColor:'#008844'}}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#trezorGradient)"/>
      <rect x="25" y="35" width="50" height="30" rx="8" fill="white"/>
      <path d="M30 45 L45 55 L70 40" stroke="#00B65A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="40" y="20" width="20" height="15" rx="3" fill="white"/>
      <rect x="45" y="25" width="10" height="5" fill="#00B65A"/>
    </svg>
  )
};

// Wallet configuration with professional icons
export const WALLET_CONFIGS = {
  'metamask-extension': {
    name: 'MetaMask',
    description: 'Connect using MetaMask browser extension',
    icon: WalletIcons.MetaMask,
    color: '#F6851B',
    installUrl: 'https://metamask.io/download/',
  },
  'metamask-mobile': {
    name: 'MetaMask Mobile',
    description: 'Open in MetaMask mobile app',
    icon: WalletIcons.MetaMask,
    color: '#F6851B',
  },
  'trust-wallet': {
    name: 'Trust Wallet',
    description: 'Open in Trust Wallet app',
    icon: WalletIcons.TrustWallet,
    color: '#3375BB',
  },
  'coinbase': {
    name: 'Coinbase Wallet',
    description: 'Connect with Coinbase Wallet',
    icon: WalletIcons.CoinbaseWallet,
    color: '#0052FF',
  },
  'rainbow': {
    name: 'Rainbow Wallet',
    description: 'Connect with Rainbow wallet',
    icon: WalletIcons.RainbowWallet,
    color: '#FF6B6B',
  },
  'walletconnect': {
    name: 'WalletConnect',
    description: 'Connect with any WalletConnect wallet',
    icon: WalletIcons.WalletConnect,
    color: '#3B99FC',
  },
  'phantom': {
    name: 'Phantom Wallet',
    description: 'Connect with Phantom wallet',
    icon: WalletIcons.PhantomWallet,
    color: '#AB9FF2',
  },
  'safepal': {
    name: 'SafePal Wallet',
    description: 'Connect with SafePal wallet',
    icon: WalletIcons.SafePal,
    color: '#4A90E2',
  },
  'exodus': {
    name: 'Exodus Wallet',
    description: 'Connect with Exodus wallet',
    icon: WalletIcons.Exodus,
    color: '#7B68EE',
  },
  'ledger': {
    name: 'Ledger Hardware',
    description: 'Connect with Ledger hardware wallet',
    icon: WalletIcons.Ledger,
    color: '#000000',
  },
  'trezor': {
    name: 'Trezor Hardware',
    description: 'Connect with Trezor hardware wallet',
    icon: WalletIcons.Trezor,
    color: '#00B65A',
  }
};