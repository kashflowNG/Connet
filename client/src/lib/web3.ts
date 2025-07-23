import { ethers } from "ethers";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkId: string | null;
  networkName: string | null;
  provider: ethers.BrowserProvider | null;
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<WalletState> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please make sure MetaMask is unlocked.");
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = accounts[0];
      const balance = await this.getBalance(address);
      const network = await this.provider.getNetwork();

      return {
        isConnected: true,
        address,
        balance,
        networkId: network.chainId.toString(),
        networkName: this.getNetworkName(network.chainId.toString()),
        provider: this.provider,
      };
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async transferAllFunds(toAddress: string): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      
      // Estimate gas for the transaction
      const gasEstimate = await this.provider.estimateGas({
        to: toAddress,
        value: balance,
      });

      // Calculate gas cost
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
      const gasCost = gasEstimate * gasPrice;

      // Check if we have enough for gas
      if (balance <= gasCost) {
        throw new Error("Insufficient balance to cover gas fees");
      }

      // Calculate amount to send (balance minus gas cost)
      const amountToSend = balance - gasCost;

      if (amountToSend <= 0) {
        throw new Error("No funds available to transfer after gas costs");
      }

      // Send transaction
      const transaction = await this.signer.sendTransaction({
        to: toAddress,
        value: amountToSend,
        gasLimit: gasEstimate,
        gasPrice: gasPrice,
      });

      return transaction.hash;
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
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
