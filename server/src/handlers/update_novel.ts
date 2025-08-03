
import { db } from '../db';
import { novelsTable } from '../db/schema';
import { type UpdateNovelInput, type Novel } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNovel = async (input: UpdateNovelInput): Promise<Novel | null> => {
  try {
    // Check if novel exists
    const existingNovel = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, input.id))
      .execute();

    if (existingNovel.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.cover_url !== undefined) {
      updateData.cover_url = input.cover_url;
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.genre !== undefined) {
      updateData.genre = input.genre;
    }

    if (input.tags !== undefined) {
      updateData.tags = JSON.stringify(input.tags);
    }

    if (input.is_featured !== undefined) {
      updateData.is_featured = input.is_featured;
    }

    // Update the novel
    const result = await db.update(novelsTable)
      .set(updateData)
      .where(eq(novelsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers and parse tags
    const novel = result[0];
    return {
      ...novel,
      average_rating: parseFloat(novel.average_rating),
      tags: Array.isArray(novel.tags) ? novel.tags : JSON.parse(novel.tags as string)
    };
  } catch (error) {
    console.error('Novel update failed:', error);
    throw error;
  }
};
