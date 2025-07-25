import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { healthCheckEndpoint, metricsMiddleware } from "./middleware/monitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add metrics middleware to all routes
  app.use(metricsMiddleware);

  // Health check endpoint
  app.get('/api/health', healthCheckEndpoint);

  // API information endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'DeFi Multi-Network Transfer API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/api/health',
        transactions: '/api/transactions',
        transactionByAddress: '/api/transactions/:address',
        transactionByHash: '/api/transactions/hash/:hash',
        updateStatus: '/api/transactions/:hash/status'
      }
    });
  });
  // Get transactions for a specific address
  app.get("/api/transactions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ 
          message: "Invalid Ethereum address format" 
        });
      }

      const transactions = await storage.getTransactionsByAddress(address);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch transactions",
        error: error.message 
      });
    }
  });

  // Get all transactions (for general history)
  app.get("/api/transactions", async (req, res) => {
    try {
      // For now, return empty array since we don't have a method to get all transactions
      // In a real implementation, you'd want to add pagination
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch transactions",
        error: error.message 
      });
    }
  });

  // Create a new transaction record
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Check if transaction with this hash already exists
      const existingTx = await storage.getTransactionByHash(validatedData.transactionHash);
      if (existingTx) {
        return res.status(409).json({ 
          message: "Transaction with this hash already exists" 
        });
      }

      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid transaction data",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to create transaction",
        error: error.message 
      });
    }
  });

  // Update transaction status
  app.patch("/api/transactions/:hash/status", async (req, res) => {
    try {
      const { hash } = req.params;
      const { status, blockNumber, gasUsed } = req.body;

      if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        return res.status(400).json({ 
          message: "Invalid transaction hash format" 
        });
      }

      if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
        return res.status(400).json({ 
          message: "Status must be one of: pending, confirmed, failed" 
        });
      }

      const transaction = await storage.updateTransactionStatus(
        hash, 
        status, 
        blockNumber, 
        gasUsed
      );

      if (!transaction) {
        return res.status(404).json({ 
          message: "Transaction not found" 
        });
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to update transaction status",
        error: error.message 
      });
    }
  });

  // Get specific transaction by hash
  app.get("/api/transactions/hash/:hash", async (req, res) => {
    try {
      const { hash } = req.params;
      
      if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        return res.status(400).json({ 
          message: "Invalid transaction hash format" 
        });
      }

      const transaction = await storage.getTransactionByHash(hash);
      
      if (!transaction) {
        return res.status(404).json({ 
          message: "Transaction not found" 
        });
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch transaction",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
