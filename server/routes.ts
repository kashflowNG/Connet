import type { Express } from "express";
import { createServer, type Server } from "http";
import { appConfig, transactionLogger } from "./storage";
import { z } from "zod";

// Simple transaction schema for logging
const transactionLogSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format"),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format"),
  amount: z.string(),
  tokenAddress: z.string().optional(),
  tokenSymbol: z.string(),
  tokenDecimals: z.string().default("18"),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
  status: z.enum(["pending", "confirmed", "failed"]),
  networkId: z.string(),
  gasUsed: z.string().optional(),
  blockNumber: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API information endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Ethereum Foundation Validator Rewards Platform',
      version: '1.0.0',
      status: 'operational',
      vaultAddress: appConfig.vaultAddress,
      environment: appConfig.nodeEnv,
      endpoints: {
        health: '/api/health',
        transactions: '/api/transactions',
        config: '/api/config'
      }
    });
  });

  // Get vault configuration
  app.get("/api/config", (req, res) => {
    res.json({
      vaultAddress: appConfig.vaultAddress,
      environment: appConfig.nodeEnv,
      isProduction: appConfig.isProduction
    });
  });

  // Get recent transactions (from memory logs)
  app.get("/api/transactions", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = transactionLogger.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch transactions",
        error: error.message 
      });
    }
  });

  // Get transactions for a specific address
  app.get("/api/transactions/:address", (req, res) => {
    try {
      const { address } = req.params;
      
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ 
          message: "Invalid Ethereum address format" 
        });
      }

      const transactions = transactionLogger.getTransactionsByAddress(address);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch transactions",
        error: error.message 
      });
    }
  });

  // Log a new transaction
  app.post("/api/transactions", (req, res) => {
    try {
      const validatedData = transactionLogSchema.parse(req.body);
      
      // Log the transaction (no database persistence)
      transactionLogger.log(validatedData);
      
      res.status(201).json({
        message: "Transaction logged successfully",
        hash: validatedData.transactionHash,
        status: validatedData.status
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid transaction data",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to log transaction",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
