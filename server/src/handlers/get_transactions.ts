
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type Transaction } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getTransactions = async (userId?: number): Promise<Transaction[]> => {
  try {
    // Build the base query with ordering
    const baseQuery = db.select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.created_at));

    // Execute query with or without user filter
    const results = userId !== undefined
      ? await baseQuery.where(eq(transactionsTable.user_id, userId)).execute()
      : await baseQuery.execute();

    // Convert numeric fields back to numbers before returning
    return results.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Transaction retrieval failed:', error);
    throw error;
  }
};
