
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable } from '../db/schema';
import { type GetNovelsQuery } from '../schema';
import { getNovels } from '../handlers/get_novels';
import { eq } from 'drizzle-orm';

// Helper function to create a test user directly
async function createTestUser(userData: { username: string; email: string; role?: string }) {
  const result = await db.insert(usersTable)
    .values({
      username: userData.username,
      email: userData.email,
      password_hash: 'hashed_password_123', // Simple static hash for tests
      role: (userData.role as any) || 'reader',
      coins_balance: '0'
    })
    .returning()
    .execute();

  return {
    ...result[0],
    coins_balance: parseFloat(result[0].coins_balance)
  };
}

// Helper function to create a test novel directly
async function createTestNovel(novelData: { title: string; description: string; genre: string; tags: string[]; author_id: number }) {
  const result = await db.insert(novelsTable)
    .values({
      title: novelData.title,
      description: novelData.description,
      genre: novelData.genre,
      tags: novelData.tags,
      author_id: novelData.author_id,
      status: 'draft',
      total_chapters: 0,
      total_views: 0,
      total_likes: 0,
      average_rating: '0',
      is_featured: false
    })
    .returning()
    .execute();

  return {
    ...result[0],
    average_rating: parseFloat(result[0].average_rating),
    tags: Array.isArray(result[0].tags) ? result[0].tags : []
  };
}

describe('getNovels', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no novels exist', async () => {
    const query: GetNovelsQuery = {
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    expect(result).toEqual([]);
  });

  it('should return all novels with default pagination', async () => {
    // Create test user first
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });

    // Create test novels
    await createTestNovel({
      title: 'Fantasy Adventure',
      description: 'An epic fantasy novel about dragons and magic',
      genre: 'fantasy',
      tags: ['magic', 'dragons'],
      author_id: user.id
    });

    await createTestNovel({
      title: 'Sci-Fi Thriller',
      description: 'A thrilling science fiction story set in space',
      genre: 'sci-fi',
      tags: ['space', 'technology'],
      author_id: user.id
    });

    await createTestNovel({
      title: 'Romance Story',
      description: 'A heartwarming romance between two unlikely characters',
      genre: 'romance',
      tags: ['love', 'relationships'],
      author_id: user.id
    });

    const query: GetNovelsQuery = {
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(3);
    expect(result[0].title).toBeDefined();
    expect(result[0].genre).toBeDefined();
    expect(typeof result[0].average_rating).toBe('number');
    expect(Array.isArray(result[0].tags)).toBe(true);
  });

  it('should filter novels by genre', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });
    
    await createTestNovel({
      title: 'Fantasy Adventure',
      description: 'An epic fantasy novel about dragons and magic',
      genre: 'fantasy',
      tags: ['magic', 'dragons'],
      author_id: user.id
    });

    await createTestNovel({
      title: 'Sci-Fi Thriller',
      description: 'A thrilling science fiction story set in space',
      genre: 'sci-fi',
      tags: ['space', 'technology'],
      author_id: user.id
    });

    const query: GetNovelsQuery = {
      genre: 'fantasy',
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(1);
    expect(result[0].genre).toBe('fantasy');
    expect(result[0].title).toBe('Fantasy Adventure');
  });

  it('should filter novels by author_id', async () => {
    const user1 = await createTestUser({
      username: 'author1',
      email: 'author1@example.com',
      role: 'author'
    });

    const user2 = await createTestUser({
      username: 'author2',
      email: 'author2@example.com',
      role: 'author'
    });
    
    await createTestNovel({
      title: 'Fantasy Adventure',
      description: 'An epic fantasy novel about dragons and magic',
      genre: 'fantasy',
      tags: ['magic', 'dragons'],
      author_id: user1.id
    });

    await createTestNovel({
      title: 'Sci-Fi Thriller',
      description: 'A thrilling science fiction story set in space',
      genre: 'sci-fi',
      tags: ['space', 'technology'],
      author_id: user2.id
    });

    const query: GetNovelsQuery = {
      author_id: user1.id,
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(1);
    expect(result[0].author_id).toBe(user1.id);
    expect(result[0].title).toBe('Fantasy Adventure');
  });

  it('should filter novels by status', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });

    const novel = await createTestNovel({
      title: 'Fantasy Adventure',
      description: 'An epic fantasy novel about dragons and magic',
      genre: 'fantasy',
      tags: ['magic', 'dragons'],
      author_id: user.id
    });

    // Update novel status to ongoing
    await db.update(novelsTable)
      .set({ status: 'ongoing' })
      .where(eq(novelsTable.id, novel.id))
      .execute();

    const query: GetNovelsQuery = {
      status: 'ongoing',
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('ongoing');
  });

  it('should filter novels by featured status', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });

    const novel = await createTestNovel({
      title: 'Fantasy Adventure',
      description: 'An epic fantasy novel about dragons and magic',
      genre: 'fantasy',
      tags: ['magic', 'dragons'],
      author_id: user.id
    });

    // Update novel to be featured
    await db.update(novelsTable)
      .set({ is_featured: true })
      .where(eq(novelsTable.id, novel.id))
      .execute();

    // Non-featured novel
    await createTestNovel({
      title: 'Sci-Fi Thriller',
      description: 'A thrilling science fiction story set in space',
      genre: 'sci-fi',
      tags: ['space', 'technology'],
      author_id: user.id
    });

    const query: GetNovelsQuery = {
      featured: true,
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(1);
    expect(result[0].is_featured).toBe(true);
    expect(result[0].title).toBe('Fantasy Adventure');
  });

  it('should apply pagination correctly', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });
    
    await createTestNovel({
      title: 'Novel 1',
      description: 'First novel',
      genre: 'fantasy',
      tags: [],
      author_id: user.id
    });

    await createTestNovel({
      title: 'Novel 2',
      description: 'Second novel',
      genre: 'sci-fi',
      tags: [],
      author_id: user.id
    });

    await createTestNovel({
      title: 'Novel 3',
      description: 'Third novel',
      genre: 'romance',
      tags: [],
      author_id: user.id
    });

    // Get first page
    const query1: GetNovelsQuery = {
      limit: 2,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result1 = await getNovels(query1);
    expect(result1).toHaveLength(2);

    // Get second page
    const query2: GetNovelsQuery = {
      limit: 2,
      offset: 2,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result2 = await getNovels(query2);
    expect(result2).toHaveLength(1);

    // Ensure no overlap
    const firstPageIds = result1.map(n => n.id);
    const secondPageIds = result2.map(n => n.id);
    expect(firstPageIds).not.toContain(secondPageIds[0]);
  });

  it('should sort novels by total_views descending', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });
    
    const novel1 = await createTestNovel({
      title: 'Novel 1',
      description: 'First novel',
      genre: 'fantasy',
      tags: [],
      author_id: user.id
    });

    const novel2 = await createTestNovel({
      title: 'Novel 2',
      description: 'Second novel',
      genre: 'sci-fi',
      tags: [],
      author_id: user.id
    });

    // Update view counts
    await db.update(novelsTable)
      .set({ total_views: 100 })
      .where(eq(novelsTable.id, novel1.id))
      .execute();

    await db.update(novelsTable)
      .set({ total_views: 200 })
      .where(eq(novelsTable.id, novel2.id))
      .execute();

    const query: GetNovelsQuery = {
      limit: 20,
      offset: 0,
      sort_by: 'total_views',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(2);
    expect(result[0].total_views).toBe(200);
    expect(result[1].total_views).toBe(100);
  });

  it('should sort novels by created_at ascending', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });
    
    const novel1 = await createTestNovel({
      title: 'First Novel',
      description: 'First novel created',
      genre: 'fantasy',
      tags: [],
      author_id: user.id
    });

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const novel2 = await createTestNovel({
      title: 'Second Novel',
      description: 'Second novel created',
      genre: 'sci-fi',
      tags: [],
      author_id: user.id
    });

    const query: GetNovelsQuery = {
      limit: 20,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'asc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(novel1.id);
    expect(result[1].id).toBe(novel2.id);
  });

  it('should handle multiple filters combined', async () => {
    const user = await createTestUser({
      username: 'testauthor',
      email: 'author@example.com',
      role: 'author'
    });
    
    const novel1 = await createTestNovel({
      title: 'Fantasy Adventure',
      description: 'An epic fantasy novel',
      genre: 'fantasy',
      tags: ['magic'],
      author_id: user.id
    });

    await createTestNovel({
      title: 'Sci-Fi Thriller',
      description: 'A sci-fi story',
      genre: 'sci-fi',
      tags: ['space'],
      author_id: user.id
    });

    // Update novel1 to be featured and ongoing
    await db.update(novelsTable)
      .set({ 
        status: 'ongoing', 
        is_featured: true 
      })
      .where(eq(novelsTable.id, novel1.id))
      .execute();

    const query: GetNovelsQuery = {
      genre: 'fantasy',
      status: 'ongoing',
      featured: true,
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    const result = await getNovels(query);
    
    expect(result).toHaveLength(1);
    expect(result[0].genre).toBe('fantasy');
    expect(result[0].status).toBe('ongoing');
    expect(result[0].is_featured).toBe(true);
  });
});
