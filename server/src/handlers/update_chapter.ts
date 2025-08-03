
import { db } from '../db';
import { chaptersTable } from '../db/schema';
import { type UpdateChapterInput, type Chapter } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateChapter(input: UpdateChapterInput): Promise<Chapter | null> {
  try {
    // First verify the chapter exists
    const existingChapter = await db.select()
      .from(chaptersTable)
      .where(eq(chaptersTable.id, input.id))
      .execute();

    if (existingChapter.length === 0) {
      return null;
    }

    // Prepare update data, converting numeric fields
    const updateData: any = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    if (input.content !== undefined) {
      updateData.content = input.content;
      // Calculate word count if content is updated
      updateData.word_count = input.content.trim().split(/\s+/).length;
    }
    
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    
    if (input.coin_cost !== undefined) {
      updateData.coin_cost = input.coin_cost.toString(); // Convert number to string for numeric column
    }
    
    if (input.is_free !== undefined) {
      updateData.is_free = input.is_free;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Perform the update
    const result = await db.update(chaptersTable)
      .set(updateData)
      .where(eq(chaptersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const updatedChapter = result[0];
    return {
      ...updatedChapter,
      coin_cost: parseFloat(updatedChapter.coin_cost) // Convert string back to number
    };
  } catch (error) {
    console.error('Chapter update failed:', error);
    throw error;
  }
}
