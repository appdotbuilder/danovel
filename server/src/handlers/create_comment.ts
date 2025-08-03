
import { db } from '../db';
import { commentsTable, chaptersTable } from '../db/schema';
import { type CreateCommentInput, type Comment } from '../schema';
import { eq } from 'drizzle-orm';

export async function createComment(input: CreateCommentInput, userId: number): Promise<Comment> {
  try {
    // Verify chapter exists
    const chapter = await db.select()
      .from(chaptersTable)
      .where(eq(chaptersTable.id, input.chapter_id))
      .execute();

    if (chapter.length === 0) {
      throw new Error('Chapter not found');
    }

    // If parent_id is provided, verify parent comment exists
    if (input.parent_id) {
      const parentComment = await db.select()
        .from(commentsTable)
        .where(eq(commentsTable.id, input.parent_id))
        .execute();

      if (parentComment.length === 0) {
        throw new Error('Parent comment not found');
      }

      // Verify parent comment is for the same chapter
      if (parentComment[0].chapter_id !== input.chapter_id) {
        throw new Error('Parent comment must be for the same chapter');
      }
    }

    // Insert comment
    const result = await db.insert(commentsTable)
      .values({
        chapter_id: input.chapter_id,
        user_id: userId,
        content: input.content,
        parent_id: input.parent_id || null,
        is_moderated: false
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Comment creation failed:', error);
    throw error;
  }
}
