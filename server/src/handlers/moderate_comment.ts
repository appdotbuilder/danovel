
import { db } from '../db';
import { commentsTable } from '../db/schema';
import { type Comment } from '../schema';
import { eq } from 'drizzle-orm';

export async function moderateComment(commentId: number, isApproved: boolean): Promise<Comment | null> {
  try {
    // Update the comment's moderation status
    const result = await db.update(commentsTable)
      .set({ 
        is_moderated: isApproved,
        updated_at: new Date()
      })
      .where(eq(commentsTable.id, commentId))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Comment moderation failed:', error);
    throw error;
  }
}
