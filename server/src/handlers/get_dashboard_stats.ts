
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, transactionsTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { count, sum, gte, desc, eq } from 'drizzle-orm';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get today's date for filtering active users
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Execute all queries in parallel
    const [
      totalUsersResult,
      totalNovelsResult,
      totalChaptersResult,
      totalRevenueResult,
      activeUsersTodayResult,
      newUsersTodayResult,
      popularNovelsResult,
      recentTransactionsResult
    ] = await Promise.all([
      // Total users count
      db.select({ count: count() }).from(usersTable).execute(),

      // Total novels count
      db.select({ count: count() }).from(novelsTable).execute(),

      // Total chapters count
      db.select({ count: count() }).from(chaptersTable).execute(),

      // Total revenue (sum of all purchase_coins transactions)
      db.select({ total: sum(transactionsTable.amount) })
        .from(transactionsTable)
        .where(eq(transactionsTable.type, 'purchase_coins'))
        .execute(),

      // Active users today (users with transactions today)
      db.select({ count: count() })
        .from(transactionsTable)
        .where(gte(transactionsTable.created_at, today))
        .execute(),

      // New users today
      db.select({ count: count() })
        .from(usersTable)
        .where(gte(usersTable.created_at, today))
        .execute(),

      // Popular novels (top 10 by total views)
      db.select()
        .from(novelsTable)
        .orderBy(desc(novelsTable.total_views))
        .limit(10)
        .execute(),

      // Recent transactions (last 10)
      db.select()
        .from(transactionsTable)
        .orderBy(desc(transactionsTable.created_at))
        .limit(10)
        .execute()
    ]);

    // Process results with proper type conversions
    const totalRevenue = totalRevenueResult[0]?.total ? parseFloat(totalRevenueResult[0].total) : 0;

    const popularNovels = popularNovelsResult.map(novel => ({
      ...novel,
      average_rating: parseFloat(novel.average_rating),
      tags: Array.isArray(novel.tags) ? novel.tags as string[] : []
    }));

    const recentTransactions = recentTransactionsResult.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount)
    }));

    return {
      total_users: totalUsersResult[0]?.count || 0,
      total_novels: totalNovelsResult[0]?.count || 0,
      total_chapters: totalChaptersResult[0]?.count || 0,
      total_revenue: totalRevenue,
      active_users_today: activeUsersTodayResult[0]?.count || 0,
      new_users_today: newUsersTodayResult[0]?.count || 0,
      popular_novels: popularNovels,
      recent_transactions: recentTransactions
    };
  } catch (error) {
    console.error('Dashboard stats retrieval failed:', error);
    throw error;
  }
}
