
import { db } from '../db';
import { usersTable, chaptersTable, transactionsTable } from '../db/schema';
import { type Transaction } from '../schema';
import { eq } from 'drizzle-orm';

export async function unlockChapter(userId: number, chapterId: number, coinCost: number): Promise<Transaction> {
  try {
    // Verify user exists and has sufficient coins
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const currentBalance = parseFloat(user.coins_balance);

    if (currentBalance < coinCost) {
      throw new Error('Insufficient coins');
    }

    // Verify chapter exists
    const chapters = await db.select()
      .from(chaptersTable)
      .where(eq(chaptersTable.id, chapterId))
      .execute();

    if (chapters.length === 0) {
      throw new Error('Chapter not found');
    }

    const chapter = chapters[0];

    // Create transaction record
    const transactionResult = await db.insert(transactionsTable)
      .values({
        user_id: userId,
        type: 'unlock_chapter',
        amount: (-coinCost).toString(), // Negative amount for spending
        description: `Unlocked chapter ${chapterId}`,
        novel_id: chapter.novel_id,
        chapter_id: chapterId
      })
      .returning()
      .execute();

    // Update user's coin balance
    const newBalance = (currentBalance - coinCost).toString();
    await db.update(usersTable)
      .set({ coins_balance: newBalance })
      .where(eq(usersTable.id, userId))
      .execute();

    // Convert numeric fields back to numbers before returning
    const transaction = transactionResult[0];
    return {
      ...transaction,
      amount: parseFloat(transaction.amount)
    };
  } catch (error) {
    console.error('Chapter unlock failed:', error);
    throw error;
  }
}
