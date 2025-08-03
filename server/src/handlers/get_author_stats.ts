
import { db } from '../db';
import { novelsTable, transactionsTable } from '../db/schema';
import { type Novel, type Transaction } from '../schema';
import { eq, desc, sum, and } from 'drizzle-orm';

interface AuthorStats {
  novels: Novel[];
  total_views: number;
  total_earnings: number;
  recent_transactions: Transaction[];
}

export async function getAuthorStats(authorId: number): Promise<AuthorStats> {
  try {
    // Get all novels by the author
    const novelsResult = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.author_id, authorId))
      .orderBy(desc(novelsTable.created_at))
      .execute();

    // Convert numeric fields for novels
    const novels: Novel[] = novelsResult.map(novel => ({
      ...novel,
      average_rating: parseFloat(novel.average_rating),
      tags: Array.isArray(novel.tags) ? novel.tags as string[] : []
    }));

    // Calculate total views from all novels
    const total_views = novels.reduce((sum, novel) => sum + novel.total_views, 0);

    // Get author earnings from transactions - filter by both type and user_id
    const earningsResult = await db.select({
      total: sum(transactionsTable.amount)
    })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, authorId),
          eq(transactionsTable.type, 'author_earning')
        )
      )
      .execute();

    const total_earnings = earningsResult[0]?.total 
      ? parseFloat(earningsResult[0].total) 
      : 0;

    // Get recent transactions for the author (last 10)
    const transactionsResult = await db.select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, authorId),
          eq(transactionsTable.type, 'author_earning')
        )
      )
      .orderBy(desc(transactionsTable.created_at))
      .limit(10)
      .execute();

    // Convert numeric fields for transactions
    const recent_transactions: Transaction[] = transactionsResult.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount)
    }));

    return {
      novels,
      total_views,
      total_earnings,
      recent_transactions
    };
  } catch (error) {
    console.error('Failed to get author stats:', error);
    throw error;
  }
}
