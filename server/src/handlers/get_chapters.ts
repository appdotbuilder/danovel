
import { db } from '../db';
import { chaptersTable } from '../db/schema';
import { type GetChaptersQuery, type Chapter } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getChapters(query: GetChaptersQuery): Promise<Chapter[]> {
  try {
    // Build the complete query in one chain
    const results = await db.select()
      .from(chaptersTable)
      .where(eq(chaptersTable.novel_id, query.novel_id))
      .orderBy(asc(chaptersTable.chapter_number))
      .limit(query.limit)
      .offset(query.offset)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(chapter => ({
      ...chapter,
      coin_cost: parseFloat(chapter.coin_cost)
    }));
  } catch (error) {
    console.error('Failed to get chapters:', error);
    throw error;
  }
}
