import { pgTable, text, serial, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: text("amount").notNull(), // Store as string to avoid precision issues
  tokenAddress: text("token_address"), // null for ETH, contract address for ERC-20
  tokenSymbol: text("token_symbol").notNull(), // ETH, USDC, DAI, etc.
  tokenDecimals: text("token_decimals").notNull().default("18"),
  transactionHash: text("transaction_hash").notNull().unique(),
  status: text("status").notNull(), // pending, confirmed, failed
  networkId: text("network_id").notNull(),
  gasUsed: text("gas_used"),
  blockNumber: text("block_number"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
