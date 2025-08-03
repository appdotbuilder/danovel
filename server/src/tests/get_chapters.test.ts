
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable } from '../db/schema';
import { type GetChaptersQuery, type CreateUserInput, type CreateNovelInput } from '../schema';
import { getChapters } from '../handlers/get_chapters';

// Test user input
const testUser: CreateUserInput = {
  username: 'testauthor',
  email: 'author@test.com',
  password: 'password123',
  role: 'author'
};

// Test novel input
const testNovel = {
  title: 'Test Novel',
  description: 'A test novel for chapters',
  genre: 'Fantasy',
  tags: ['test', 'fantasy']
};

describe('getChapters', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get chapters for a novel', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        username: testUser.username,
        email: testUser.email,
        password_hash: 'hashed_password',
        role: testUser.role,
        coins_balance: '0'
      })
      .returning()
      .execute();

    const novelResult = await db.insert(novelsTable)
      .values({
        title: testNovel.title,
        description: testNovel.description,
        author_id: userResult[0].id,
        genre: testNovel.genre,
        tags: testNovel.tags
      })
      .returning()
      .execute();

    // Create test chapters
    await db.insert(chaptersTable)
      .values([
        {
          novel_id: novelResult[0].id,
          chapter_number: 1,
          title: 'Chapter 1',
          content: 'First chapter content',
          status: 'published',
          coin_cost: '0',
          word_count: 100,
          is_free: true
        },
        {
          novel_id: novelResult[0].id,
          chapter_number: 2,
          title: 'Chapter 2',
          content: 'Second chapter content',
          status: 'published',
          coin_cost: '5.50',
          word_count: 150,
          is_free: false
        },
        {
          novel_id: novelResult[0].id,
          chapter_number: 3,
          title: 'Chapter 3',
          content: 'Third chapter content',
          status: 'draft',
          coin_cost: '0',
          word_count: 120,
          is_free: true
        }
      ])
      .execute();

    const query: GetChaptersQuery = {
      novel_id: novelResult[0].id,
      limit: 50,
      offset: 0
    };

    const result = await getChapters(query);

    // Should return all chapters for the novel
    expect(result).toHaveLength(3);
    
    // Check ordering by chapter number
    expect(result[0].chapter_number).toBe(1);
    expect(result[1].chapter_number).toBe(2);
    expect(result[2].chapter_number).toBe(3);

    // Verify numeric conversion
    expect(typeof result[0].coin_cost).toBe('number');
    expect(result[0].coin_cost).toBe(0);
    expect(result[1].coin_cost).toBe(5.5);

    // Verify other fields
    expect(result[0].title).toBe('Chapter 1');
    expect(result[0].is_free).toBe(true);
    expect(result[1].is_free).toBe(false);
  });

  it('should apply pagination correctly', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        username: testUser.username,
        email: testUser.email,
        password_hash: 'hashed_password',
        role: testUser.role,
        coins_balance: '0'
      })
      .returning()
      .execute();

    const novelResult = await db.insert(novelsTable)
      .values({
        title: testNovel.title,
        description: testNovel.description,
        author_id: userResult[0].id,
        genre: testNovel.genre,
        tags: testNovel.tags
      })
      .returning()
      .execute();

    // Create 5 chapters
    const chapters = Array.from({ length: 5 }, (_, i) => ({
      novel_id: novelResult[0].id,
      chapter_number: i + 1,
      title: `Chapter ${i + 1}`,
      content: `Content for chapter ${i + 1}`,
      status: 'published' as const,
      coin_cost: '0',
      word_count: 100,
      is_free: true
    }));

    await db.insert(chaptersTable).values(chapters).execute();

    // Test pagination - limit 2, offset 2
    const query: GetChaptersQuery = {
      novel_id: novelResult[0].id,
      limit: 2,
      offset: 2
    };

    const result = await getChapters(query);

    expect(result).toHaveLength(2);
    expect(result[0].chapter_number).toBe(3);
    expect(result[1].chapter_number).toBe(4);
  });

  it('should return empty array for non-existent novel', async () => {
    const query: GetChaptersQuery = {
      novel_id: 99999,
      limit: 50,
      offset: 0
    };

    const result = await getChapters(query);

    expect(result).toHaveLength(0);
  });

  it('should handle chapters with different statuses', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        username: testUser.username,
        email: testUser.email,
        password_hash: 'hashed_password',
        role: testUser.role,
        coins_balance: '0'
      })
      .returning()
      .execute();

    const novelResult = await db.insert(novelsTable)
      .values({
        title: testNovel.title,
        description: testNovel.description,
        author_id: userResult[0].id,
        genre: testNovel.genre,
        tags: testNovel.tags
      })
      .returning()
      .execute();

    // Create chapters with different statuses
    await db.insert(chaptersTable)
      .values([
        {
          novel_id: novelResult[0].id,
          chapter_number: 1,
          title: 'Published Chapter',
          content: 'Published content',
          status: 'published',
          coin_cost: '0',
          word_count: 100,
          is_free: true
        },
        {
          novel_id: novelResult[0].id,
          chapter_number: 2,
          title: 'Locked Chapter',
          content: 'Locked content',
          status: 'locked',
          coin_cost: '10.00',
          word_count: 200,
          is_free: false
        },
        {
          novel_id: novelResult[0].id,
          chapter_number: 3,
          title: 'Draft Chapter',
          content: 'Draft content',
          status: 'draft',
          coin_cost: '0',
          word_count: 150,
          is_free: true
        }
      ])
      .execute();

    const query: GetChaptersQuery = {
      novel_id: novelResult[0].id,
      limit: 50,
      offset: 0
    };

    const result = await getChapters(query);

    expect(result).toHaveLength(3);
    
    // Find chapters by status
    const publishedChapter = result.find(c => c.status === 'published');
    const lockedChapter = result.find(c => c.status === 'locked');
    const draftChapter = result.find(c => c.status === 'draft');

    expect(publishedChapter).toBeDefined();
    expect(lockedChapter).toBeDefined();
    expect(draftChapter).toBeDefined();

    expect(lockedChapter!.coin_cost).toBe(10);
    expect(typeof lockedChapter!.coin_cost).toBe('number');
  });
});
