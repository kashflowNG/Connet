/**
 * Production constants and configuration
 */

// Application configuration
export const APP_CONFIG = {
  name: 'DeFi Multi-Network Transfer Platform',
  version: '1.0.0',
  description: 'Secure cryptocurrency transfer across multiple blockchain networks',
  
  // Network settings
  supportedNetworks: [
    { id: '1', name: 'Ethereum', currency: 'ETH' },
    { id: '137', name: 'Polygon', currency: 'MATIC' },
    { id: '56', name: 'BNB Smart Chain', currency: 'BNB' },
    { id: '43114', name: 'Avalanche', currency: 'AVAX' },
    { id: '250', name: 'Fantom', currency: 'FTM' },
    { id: '42161', name: 'Arbitrum', currency: 'ETH' },
    { id: '10', name: 'Optimism', currency: 'ETH' }
  ],
  
  // UI settings
  theme: {
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    backgroundColor: '#fafafa'
  },
  
  // Performance settings
  performance: {
    maxRetries: 3,
    retryDelay: 1000,
    requestTimeout: 30000,
    cacheTimeout: 60000
  }
};

// Validation patterns
export const VALIDATION = {
  ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
  transactionHash: /^0x[a-fA-F0-9]{64}$/,
  amount: /^\d+(\.\d+)?$/
};

// Error codes
export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// API endpoints
export const API_ENDPOINTS = {
  transactions: '/api/transactions',
  transactionsByAddress: (address: string) => `/api/transactions/${address}`,
  transactionByHash: (hash: string) => `/api/transactions/hash/${hash}`,
  updateTransactionStatus: (hash: string) => `/api/transactions/${hash}/status`,
  health: '/api/health'
};

// Environment validation
export const validateEnvironment = () => {
  const required = ['VITE_DESTINATION_ADDRESS'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  const destinationAddress = import.meta.env.VITE_DESTINATION_ADDRESS;
  if (!VALIDATION.ethereumAddress.test(destinationAddress)) {
    throw new Error('Invalid VITE_DESTINATION_ADDRESS format');
  }
};

// Feature flags
export const FEATURES = {
  enableNetworkScanning: true,
  enableTransactionHistory: true,
  enableProductionStatus: import.meta.env.MODE === 'development',
  enablePerformanceMonitoring: true,
  enableErrorTracking: true
};