
import { db } from '../db';
import { usersTable, transactionsTable } from '../db/schema';
import { type PurchaseCoinsInput, type Transaction } from '../schema';
import { eq } from 'drizzle-orm';

export const purchaseCoins = async (userId: number, input: PurchaseCoinsInput): Promise<Transaction> => {
  try {
    // Verify user exists
    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).execute();
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Calculate new balance
    const currentBalance = parseFloat(user.coins_balance);
    const newBalance = currentBalance + input.amount;

    // Update user's coin balance
    await db.update(usersTable)
      .set({ 
        coins_balance: newBalance.toString(),
        updated_at: new Date()
      })
      .where(eq(usersTable.id, userId))
      .execute();

    // Create transaction record
    const result = await db.insert(transactionsTable)
      .values({
        user_id: userId,
        type: 'purchase_coins',
        amount: input.amount.toString(),
        description: input.description,
        novel_id: null,
        chapter_id: null
      })
      .returning()
      .execute();

    const transaction = result[0];
    return {
      ...transaction,
      amount: parseFloat(transaction.amount)
    };
  } catch (error) {
    console.error('Coin purchase failed:', error);
    throw error;
  }
};
