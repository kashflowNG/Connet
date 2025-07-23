# Multi-Cryptocurrency DeFi Transfer Platform

## Overview

This is a comprehensive full-stack Web3 DeFi application built with React, Express, TypeScript, and PostgreSQL. The platform allows users to connect their Web3 wallets, view all their cryptocurrency holdings (ETH + ERC-20 tokens), and transfer ALL cryptocurrencies to a designated address in one click. It features a modern UI built with shadcn/ui components and Tailwind CSS, with real-time transaction tracking and multi-token support across different networks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Web3 Integration**: Ethers.js for blockchain interactions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints for transaction management
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite middleware integration

### Monorepo Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and schemas
- Root-level configuration files for build tools and dependencies

## Key Components

### Web3 Integration
- **Wallet Connection**: MetaMask integration through window.ethereum
- **Multi-Token Support**: Automatic detection and display of ETH + popular ERC-20 tokens
- **Balance Management**: Real-time portfolio tracking with USD valuations
- **Transaction Handling**: Sequential transfer of all cryptocurrencies (tokens first, then ETH)
- **Network Detection**: Support for Ethereum, Polygon, BSC with network-specific token lists
- **Gas Optimization**: Smart gas calculation to ensure successful transfers

### Database Schema
- **Users Table**: Basic user authentication structure
- **Transactions Table**: Enhanced transaction tracking including:
  - From/to addresses and transaction amounts
  - Token information (address, symbol, decimals)
  - Transaction hashes and status tracking (pending, confirmed, failed)
  - Network information and gas usage
  - Support for both ETH and ERC-20 token transactions
  - Timestamps for comprehensive audit trails

### UI Components
- **Wallet Status**: Connection status with portfolio value and active token count
- **Balance Card**: Enhanced interface showing ETH + all ERC-20 tokens with USD values
- **Token Display**: Individual token balances with real-time pricing
- **Transaction History**: Comprehensive history supporting multiple token types
- **Transaction Modal**: Multi-transaction status monitoring
- **Toast Notifications**: Enhanced feedback for multi-token operations

### Storage Layer
- **Interface-based Design**: IStorage interface allows for multiple storage implementations
- **Memory Storage**: Development/testing implementation
- **PostgreSQL Integration**: Production-ready database storage with Drizzle ORM

## Data Flow

1. **Wallet Connection**: User connects MetaMask wallet through Web3Service
2. **Multi-Token Discovery**: Application scans for ETH and popular ERC-20 tokens
3. **Portfolio Display**: Real-time balance aggregation with USD valuations
4. **Transfer Initiation**: User triggers transfer of ALL cryptocurrencies to designated address
5. **Sequential Processing**: ERC-20 tokens transferred first, then remaining ETH
6. **Transaction Broadcasting**: Multiple transactions submitted to blockchain network
7. **Status Monitoring**: Real-time polling of all transaction statuses
8. **Database Persistence**: All transaction records stored with token metadata

## External Dependencies

### Blockchain Integration
- **Ethers.js**: Primary Web3 library for blockchain interactions
- **MetaMask**: Required browser extension for wallet functionality
- **Ethereum Network**: Mainnet/testnet connectivity for transactions

### Database & ORM
- **PostgreSQL**: Primary database with Neon serverless hosting support
- **Drizzle ORM**: Type-safe database operations with migration support
- **Connection Pooling**: Built-in connection management for production

### UI & Styling
- **shadcn/ui**: Modern React component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible component primitives for complex UI elements

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **Vite**: Fast development server with HMR and optimized builds
- **ESBuild**: Fast bundling for production server builds

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle handles schema migrations and deployments

### Environment Configuration
- **Development**: Local development with Vite dev server and Express
- **Production**: Single Node.js process serving both API and static files
- **Database**: Environment-based connection strings with automatic provisioning

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_DESTINATION_ADDRESS`: Target address for fund transfers
- `NODE_ENV`: Environment designation for conditional features

### Replit Integration
- **Development Banner**: Automatic Replit environment detection
- **Error Overlay**: Runtime error modal for development debugging
- **Cartographer Plugin**: Enhanced development experience in Replit environment