import { configSchema, type Config, type TransactionLog } from "@shared/schema";

// Configuration management
export class AppConfig {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    const rawConfig = {
      vaultAddress: process.env.VITE_DESTINATION_ADDRESS || "",
      nodeEnv: process.env.NODE_ENV as "development" | "production" || "development",
      port: parseInt(process.env.PORT || "5000", 10),
    };

    try {
      return configSchema.parse(rawConfig);
    } catch (error: any) {
      console.error("Configuration validation failed:", error.message);
      console.error("Please check your environment variables:");
      console.error("Required: VITE_DESTINATION_ADDRESS (vault address)");
      process.exit(1);
    }
  }

  get vaultAddress(): string {
    return this.config.vaultAddress;
  }

  get nodeEnv(): string {
    return this.config.nodeEnv;
  }

  get port(): number {
    return this.config.port;
  }

  get isProduction(): boolean {
    return this.config.nodeEnv === "production";
  }

  get isDevelopment(): boolean {
    return this.config.nodeEnv === "development";
  }
}

// Simple transaction logger (no database persistence)
export class TransactionLogger {
  private logs: TransactionLog[] = [];

  log(transaction: Omit<TransactionLog, 'timestamp'>): void {
    const logEntry: TransactionLog = {
      ...transaction,
      timestamp: new Date()
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 100 transactions in memory
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
    
    // Log to console for debugging
    console.log(`Transaction logged: ${transaction.transactionHash} - ${transaction.status}`);
  }

  getRecentTransactions(limit: number = 10): TransactionLog[] {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getTransactionsByAddress(address: string): TransactionLog[] {
    return this.logs
      .filter(log => log.fromAddress.toLowerCase() === address.toLowerCase())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Export singleton instances
export const appConfig = new AppConfig();
export const transactionLogger = new TransactionLogger();
