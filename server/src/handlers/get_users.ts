
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUsersQuery, type User } from '../schema';
import { eq, and, SQL } from 'drizzle-orm';

export async function getUsers(query: GetUsersQuery): Promise<User[]> {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    if (query.role !== undefined) {
      conditions.push(eq(usersTable.role, query.role));
    }

    if (query.is_active !== undefined) {
      conditions.push(eq(usersTable.is_active, query.is_active));
    }

    // Build the final query in one go
    const results = conditions.length === 0
      ? await db.select()
          .from(usersTable)
          .limit(query.limit)
          .offset(query.offset)
          .execute()
      : await db.select()
          .from(usersTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .limit(query.limit)
          .offset(query.offset)
          .execute();

    // Convert numeric fields back to numbers
    return results.map(user => ({
      ...user,
      coins_balance: parseFloat(user.coins_balance)
    }));
  } catch (error) {
    console.error('Get users failed:', error);
    throw error;
  }
}
