
import { db } from '../db';
import { commentsTable, usersTable } from '../db/schema';
import { type Comment } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getComments(chapterId: number): Promise<Comment[]> {
  try {
    // Query comments with user information for the chapter, ordered by creation date
    const results = await db.select({
      id: commentsTable.id,
      chapter_id: commentsTable.chapter_id,
      user_id: commentsTable.user_id,
      content: commentsTable.content,
      parent_id: commentsTable.parent_id,
      is_moderated: commentsTable.is_moderated,
      created_at: commentsTable.created_at,
      updated_at: commentsTable.updated_at
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.user_id, usersTable.id))
    .where(eq(commentsTable.chapter_id, chapterId))
    .orderBy(asc(commentsTable.created_at))
    .execute();

    // Transform results to match Comment schema
    return results.map(result => ({
      id: result.id,
      chapter_id: result.chapter_id,
      user_id: result.user_id,
      content: result.content,
      parent_id: result.parent_id,
      is_moderated: result.is_moderated,
      created_at: result.created_at,
      updated_at: result.updated_at
    }));
  } catch (error) {
    console.error('Failed to get comments:', error);
    throw error;
  }
}
