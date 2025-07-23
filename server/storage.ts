import { transactions, type Transaction, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByHash(hash: string): Promise<Transaction | undefined>;
  getTransactionsByAddress(address: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(hash: string, status: string, blockNumber?: string, gasUsed?: string): Promise<Transaction | undefined>;
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

export const storage = new MemStorage();
