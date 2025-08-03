
import { db } from '../db';
import { readingProgressTable, novelsTable, chaptersTable } from '../db/schema';
import { type ReadingProgress } from '../schema';
import { eq } from 'drizzle-orm';

export async function getReadingProgress(userId: number): Promise<ReadingProgress[]> {
  try {
    // Query reading progress with joined novel and chapter data for validation
    const results = await db.select()
      .from(readingProgressTable)
      .innerJoin(novelsTable, eq(readingProgressTable.novel_id, novelsTable.id))
      .innerJoin(chaptersTable, eq(readingProgressTable.last_chapter_id, chaptersTable.id))
      .where(eq(readingProgressTable.user_id, userId))
      .execute();

    // Map results back to ReadingProgress format
    return results.map(result => ({
      id: result.reading_progress.id,
      user_id: result.reading_progress.user_id,
      novel_id: result.reading_progress.novel_id,
      last_chapter_id: result.reading_progress.last_chapter_id,
      last_read_at: result.reading_progress.last_read_at,
      is_favorite: result.reading_progress.is_favorite,
      created_at: result.reading_progress.created_at,
      updated_at: result.reading_progress.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch reading progress:', error);
    throw error;
  }
}
