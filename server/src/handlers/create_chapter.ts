
import { db } from '../db';
import { chaptersTable, novelsTable } from '../db/schema';
import { type CreateChapterInput, type Chapter } from '../schema';
import { eq, max } from 'drizzle-orm';

export const createChapter = async (input: CreateChapterInput): Promise<Chapter> => {
  try {
    // First, verify the novel exists
    const novel = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, input.novel_id))
      .limit(1)
      .execute();

    if (novel.length === 0) {
      throw new Error(`Novel with id ${input.novel_id} not found`);
    }

    // Get the next chapter number for this novel
    const maxChapterResult = await db.select({
      maxNumber: max(chaptersTable.chapter_number)
    })
      .from(chaptersTable)
      .where(eq(chaptersTable.novel_id, input.novel_id))
      .execute();

    const nextChapterNumber = (maxChapterResult[0]?.maxNumber || 0) + 1;

    // Calculate word count - handle empty content and normalize whitespace
    const wordCount = input.content.trim() === '' ? 0 : input.content.trim().split(/\s+/).length;

    // Insert chapter record
    const result = await db.insert(chaptersTable)
      .values({
        novel_id: input.novel_id,
        chapter_number: nextChapterNumber,
        title: input.title,
        content: input.content,
        status: 'draft',
        coin_cost: input.coin_cost.toString(), // Convert number to string for numeric column
        word_count: wordCount,
        views: 0,
        is_free: input.is_free
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const chapter = result[0];
    return {
      ...chapter,
      coin_cost: parseFloat(chapter.coin_cost) // Convert string back to number
    };
  } catch (error) {
    console.error('Chapter creation failed:', error);
    throw error;
  }
};
