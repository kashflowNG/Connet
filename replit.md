# DeFi Transfer Application

## Overview

This is a full-stack Web3 DeFi application built with React, Express, TypeScript, and PostgreSQL. The application allows users to connect their Web3 wallets, view their balance, and transfer all funds to a designated address. It features a modern UI built with shadcn/ui components and Tailwind CSS, with real-time transaction tracking and status updates.

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
- **Balance Management**: Real-time ETH balance fetching and display
- **Transaction Handling**: Automated fund transfer functionality with gas estimation
- **Network Detection**: Multi-network support with proper network identification

### Database Schema
- **Users Table**: Basic user authentication structure
- **Transactions Table**: Comprehensive transaction tracking including:
  - From/to addresses
  - Transaction amounts and hashes
  - Status tracking (pending, confirmed, failed)
  - Network information and gas usage
  - Timestamps for audit trails

### UI Components
- **Wallet Status**: Connection status and balance display
- **Balance Card**: Main interface for viewing balance and initiating transfers
- **Transaction History**: List of past transactions with status indicators
- **Transaction Modal**: Real-time transaction status monitoring
- **Toast Notifications**: User feedback for actions and errors

### Storage Layer
- **Interface-based Design**: IStorage interface allows for multiple storage implementations
- **Memory Storage**: Development/testing implementation
- **PostgreSQL Integration**: Production-ready database storage with Drizzle ORM

## Data Flow

1. **Wallet Connection**: User connects MetaMask wallet through Web3Service
2. **Balance Retrieval**: Application fetches and displays current ETH balance
3. **Transfer Initiation**: User triggers transfer of all funds to designated address
4. **Transaction Creation**: Backend creates transaction record in database
5. **Blockchain Interaction**: Frontend submits transaction to Ethereum network
6. **Status Monitoring**: Real-time polling of transaction status via blockchain
7. **Database Updates**: Transaction status updates stored for history tracking

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