
import { db } from '../db';
import { novelsTable } from '../db/schema';
import { type Novel, type GetNovelsQuery } from '../schema';
import { eq, and, desc, asc, SQL } from 'drizzle-orm';

export async function getNovels(query: GetNovelsQuery): Promise<Novel[]> {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    if (query.genre) {
      conditions.push(eq(novelsTable.genre, query.genre));
    }

    if (query.status) {
      conditions.push(eq(novelsTable.status, query.status));
    }

    if (query.featured !== undefined) {
      conditions.push(eq(novelsTable.is_featured, query.featured));
    }

    if (query.author_id) {
      conditions.push(eq(novelsTable.author_id, query.author_id));
    }

    // Build the complete query in one go
    const orderByColumn = novelsTable[query.sort_by];
    const orderDirection = query.sort_order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);

    let finalQuery;
    
    if (conditions.length > 0) {
      finalQuery = db.select()
        .from(novelsTable)
        .where(and(...conditions))
        .orderBy(orderDirection)
        .limit(query.limit)
        .offset(query.offset);
    } else {
      finalQuery = db.select()
        .from(novelsTable)
        .orderBy(orderDirection)
        .limit(query.limit)
        .offset(query.offset);
    }

    const results = await finalQuery.execute();

    // Convert numeric fields back to numbers and handle tags
    return results.map(novel => ({
      ...novel,
      average_rating: parseFloat(novel.average_rating),
      tags: Array.isArray(novel.tags) ? novel.tags : []
    }));
  } catch (error) {
    console.error('Get novels failed:', error);
    throw error;
  }
}
