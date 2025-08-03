
import { db } from '../db';
import { novelsTable, usersTable } from '../db/schema';
import { type CreateNovelInput, type Novel } from '../schema';
import { eq } from 'drizzle-orm';

export const createNovel = async (input: CreateNovelInput, authorId: number): Promise<Novel> => {
  try {
    // Verify author exists and has appropriate permissions
    const author = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, authorId))
      .execute();

    if (author.length === 0) {
      throw new Error('Author not found');
    }

    if (author[0].role !== 'author' && author[0].role !== 'admin') {
      throw new Error('User does not have permission to create novels');
    }

    if (!author[0].is_active) {
      throw new Error('Author account is not active');
    }

    // Insert novel record
    const result = await db.insert(novelsTable)
      .values({
        title: input.title,
        description: input.description,
        cover_url: input.cover_url || null,
        author_id: authorId,
        genre: input.genre,
        tags: JSON.stringify(input.tags) // Convert array to JSON string for storage
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers and parse tags
    const novel = result[0];
    return {
      ...novel,
      average_rating: parseFloat(novel.average_rating),
      tags: typeof novel.tags === 'string' ? JSON.parse(novel.tags) : novel.tags
    };
  } catch (error) {
    console.error('Novel creation failed:', error);
    throw error;
  }
};
