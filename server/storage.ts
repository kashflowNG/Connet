import { transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByHash(hash: string): Promise<Transaction | undefined>;
  getTransactionsByAddress(address: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(hash: string, status: string, blockNumber?: string, gasUsed?: string): Promise<Transaction | undefined>;
}

// PostgreSQL storage implementation for production
export class PostgreSQLStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for PostgreSQL storage");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    try {
      const result = await this.db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error: any) {
      console.error(`Failed to get transaction ${id}:`, error);
      throw new Error(`Database error retrieving transaction: ${error.message}`);
    }
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    try {
      const result = await this.db.select().from(transactions).where(eq(transactions.transactionHash, hash)).limit(1);
      return result[0] || undefined;
    } catch (error: any) {
      console.error(`Failed to get transaction by hash ${hash}:`, error);
      throw new Error(`Database error retrieving transaction: ${error.message}`);
    }
  }

  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    try {
      const result = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.fromAddress, address.toLowerCase()))
        .orderBy(desc(transactions.timestamp))
        .limit(100); // Limit for performance
      return result;
    } catch (error: any) {
      console.error(`Failed to get transactions for address ${address}:`, error);
      throw new Error(`Database error retrieving transactions: ${error.message}`);
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    try {
      const result = await this.db
        .insert(transactions)
        .values({
          ...insertTransaction,
          fromAddress: insertTransaction.fromAddress.toLowerCase(),
          toAddress: insertTransaction.toAddress.toLowerCase(),
        })
        .returning();
      
      if (!result[0]) {
        throw new Error("Failed to create transaction - no result returned");
      }
      
      return result[0];
    } catch (error: any) {
      console.error(`Failed to create transaction:`, error);
      if (error.code === '23505') { // Unique constraint violation
        throw new Error("Transaction with this hash already exists");
      }
      throw new Error(`Database error creating transaction: ${error.message}`);
    }
  }

  async updateTransactionStatus(
    hash: string,
    status: string,
    blockNumber?: string,
    gasUsed?: string
  ): Promise<Transaction | undefined> {
    try {
      const updateData: Partial<Transaction> = { status };
      if (blockNumber !== undefined) updateData.blockNumber = blockNumber;
      if (gasUsed !== undefined) updateData.gasUsed = gasUsed;

      const result = await this.db
        .update(transactions)
        .set(updateData)
        .where(eq(transactions.transactionHash, hash))
        .returning();
      
      return result[0] || undefined;
    } catch (error: any) {
      console.error(`Failed to update transaction status for ${hash}:`, error);
      throw new Error(`Database error updating transaction: ${error.message}`);
    }
  }
}

export class MemStorage implements IStorage {
  private transactions: Map<number, Transaction>;
  private currentId: number;

  constructor() {
    this.transactions = new Map();
    this.currentId = 1;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.transactionHash === hash,
    );
  }

  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.fromAddress.toLowerCase() === address.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      tokenAddress: insertTransaction.tokenAddress || null,
      tokenDecimals: insertTransaction.tokenDecimals || "18",
      gasUsed: insertTransaction.gasUsed || null,
      blockNumber: insertTransaction.blockNumber || null,
      timestamp: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(
    hash: string,
    status: string,
    blockNumber?: string,
    gasUsed?: string
  ): Promise<Transaction | undefined> {
    const transaction = await this.getTransactionByHash(hash);
    if (!transaction) {
      return undefined;
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      status,
      blockNumber: blockNumber || transaction.blockNumber,
      gasUsed: gasUsed || transaction.gasUsed,
    };

    this.transactions.set(transaction.id, updatedTransaction);
    return updatedTransaction;
  }
}

// Create storage instance based on environment
export const storage = process.env.NODE_ENV === 'production' 
  ? new PostgreSQLStorage() 
  : new MemStorage();
