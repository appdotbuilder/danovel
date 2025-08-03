
import { db } from '../db';
import { readingProgressTable } from '../db/schema';
import { type ReadingProgress } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function updateReadingProgress(
  userId: number, 
  novelId: number, 
  chapterId: number
): Promise<ReadingProgress> {
  try {
    // First check if reading progress already exists for this user and novel
    const existingProgress = await db.select()
      .from(readingProgressTable)
      .where(and(
        eq(readingProgressTable.user_id, userId),
        eq(readingProgressTable.novel_id, novelId)
      ))
      .execute();

    let result;

    if (existingProgress.length > 0) {
      // Update existing progress
      const updated = await db.update(readingProgressTable)
        .set({
          last_chapter_id: chapterId,
          last_read_at: new Date(),
          updated_at: new Date()
        })
        .where(and(
          eq(readingProgressTable.user_id, userId),
          eq(readingProgressTable.novel_id, novelId)
        ))
        .returning()
        .execute();
      
      result = updated[0];
    } else {
      // Create new progress record
      const created = await db.insert(readingProgressTable)
        .values({
          user_id: userId,
          novel_id: novelId,
          last_chapter_id: chapterId,
          last_read_at: new Date(),
          is_favorite: false
        })
        .returning()
        .execute();
      
      result = created[0];
    }

    return result;
  } catch (error) {
    console.error('Update reading progress failed:', error);
    throw error;
  }
}
