import { z } from "zod";

// Configuration schema for environment variables
export const configSchema = z.object({
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  nodeEnv: z.enum(["development", "production"]).default("development"),
  port: z.number().default(5000),
});

export type Config = z.infer<typeof configSchema>;

// Simple transaction interface for logging (no database)
export interface TransactionLog {
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenAddress?: string;
  tokenSymbol: string;
  tokenDecimals: string;
  transactionHash: string;
  status: string;
  networkId: string;
  gasUsed?: string;
  blockNumber?: string;
  timestamp: Date;
}
