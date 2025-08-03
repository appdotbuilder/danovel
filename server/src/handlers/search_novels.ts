
import { db } from '../db';
import { novelsTable, usersTable } from '../db/schema';
import { type Novel } from '../schema';
import { ilike, or, sql } from 'drizzle-orm';

export async function searchNovels(query: string, limit: number = 20): Promise<Novel[]> {
  try {
    // Build search conditions for title, description, genre, and tags
    const searchTerm = `%${query}%`;
    
    const results = await db.select({
      id: novelsTable.id,
      title: novelsTable.title,
      description: novelsTable.description,
      cover_url: novelsTable.cover_url,
      author_id: novelsTable.author_id,
      status: novelsTable.status,
      genre: novelsTable.genre,
      tags: novelsTable.tags,
      total_chapters: novelsTable.total_chapters,
      total_views: novelsTable.total_views,
      total_likes: novelsTable.total_likes,
      average_rating: novelsTable.average_rating,
      is_featured: novelsTable.is_featured,
      created_at: novelsTable.created_at,
      updated_at: novelsTable.updated_at,
      author_username: usersTable.username
    })
    .from(novelsTable)
    .innerJoin(usersTable, sql`${novelsTable.author_id} = ${usersTable.id}`)
    .where(
      or(
        ilike(novelsTable.title, searchTerm),
        ilike(novelsTable.description, searchTerm),
        ilike(novelsTable.genre, searchTerm),
        ilike(usersTable.username, searchTerm),
        sql`${novelsTable.tags}::text ILIKE ${searchTerm}`
      )
    )
    .limit(limit)
    .execute();

    // Convert numeric fields back to numbers
    return results.map(result => ({
      id: result.id,
      title: result.title,
      description: result.description,
      cover_url: result.cover_url,
      author_id: result.author_id,
      status: result.status,
      genre: result.genre,
      tags: result.tags as string[],
      total_chapters: result.total_chapters,
      total_views: result.total_views,
      total_likes: result.total_likes,
      average_rating: parseFloat(result.average_rating),
      is_featured: result.is_featured,
      created_at: result.created_at,
      updated_at: result.updated_at
    }));
  } catch (error) {
    console.error('Novel search failed:', error);
    throw error;
  }
}
