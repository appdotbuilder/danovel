
import { db } from '../db';
import { readingProgressTable, usersTable, novelsTable } from '../db/schema';
import { type ReadingProgress } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function toggleFavorite(userId: number, novelId: number): Promise<ReadingProgress | null> {
  try {
    // Check if user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (user.length === 0) {
      throw new Error('User not found');
    }

    // Check if novel exists
    const novel = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, novelId))
      .execute();

    if (novel.length === 0) {
      throw new Error('Novel not found');
    }

    // Check if reading progress record exists
    const existingProgress = await db.select()
      .from(readingProgressTable)
      .where(
        and(
          eq(readingProgressTable.user_id, userId),
          eq(readingProgressTable.novel_id, novelId)
        )
      )
      .execute();

    if (existingProgress.length === 0) {
      // No reading progress exists, cannot toggle favorite without a progress record
      return null;
    }

    // Toggle the favorite status
    const currentFavoriteStatus = existingProgress[0].is_favorite;
    const newFavoriteStatus = !currentFavoriteStatus;

    const result = await db.update(readingProgressTable)
      .set({
        is_favorite: newFavoriteStatus,
        updated_at: new Date()
      })
      .where(
        and(
          eq(readingProgressTable.user_id, userId),
          eq(readingProgressTable.novel_id, novelId)
        )
      )
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Toggle favorite failed:', error);
    throw error;
  }
}
