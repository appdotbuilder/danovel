
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable } from '../db/schema';
import { searchNovels } from '../handlers/search_novels';

describe('searchNovels', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should search novels by title', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test novels
    await db.insert(novelsTable)
      .values([
        {
          title: 'Fantasy Adventure',
          description: 'An epic fantasy story',
          author_id: userId,
          genre: 'Fantasy',
          tags: ['adventure', 'magic']
        },
        {
          title: 'Science Fiction Novel',
          description: 'A story about the future',
          author_id: userId,
          genre: 'Sci-Fi',
          tags: ['space', 'technology']
        },
        {
          title: 'Romance Story',
          description: 'A beautiful love story',
          author_id: userId,
          genre: 'Romance',
          tags: ['love', 'drama']
        }
      ])
      .execute();

    const results = await searchNovels('Fantasy', 10);

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Fantasy Adventure');
    expect(results[0].genre).toEqual('Fantasy');
    expect(typeof results[0].average_rating).toBe('number');
    expect(results[0].tags).toEqual(['adventure', 'magic']);
  });

  it('should search novels by description', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor2',
        email: 'author2@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test novel
    await db.insert(novelsTable)
      .values({
        title: 'Mystery Book',
        description: 'A thrilling detective story with unexpected twists',
        author_id: userId,
        genre: 'Mystery',
        tags: ['detective', 'thriller']
      })
      .execute();

    const results = await searchNovels('detective', 10);

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Mystery Book');
    expect(results[0].description).toContain('detective');
  });

  it('should search novels by author username', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'uniqueauthor',
        email: 'unique@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test novel
    await db.insert(novelsTable)
      .values({
        title: 'Authors Novel',
        description: 'A novel by unique author',
        author_id: userId,
        genre: 'Fiction',
        tags: ['original']
      })
      .execute();

    const results = await searchNovels('uniqueauthor', 10);

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Authors Novel');
    expect(results[0].author_id).toEqual(userId);
  });

  it('should search novels by genre', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'genreauthor',
        email: 'genre@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test novels
    await db.insert(novelsTable)
      .values([
        {
          title: 'Horror Story 1',
          description: 'A scary story',
          author_id: userId,
          genre: 'Horror',
          tags: ['scary', 'dark']
        },
        {
          title: 'Horror Story 2',
          description: 'Another scary story',
          author_id: userId,
          genre: 'Horror',
          tags: ['ghost', 'supernatural']
        }
      ])
      .execute();

    const results = await searchNovels('Horror', 10);

    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result.genre).toEqual('Horror');
    });
  });

  it('should search novels by tags', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'tagauthor',
        email: 'tag@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test novel with specific tags
    await db.insert(novelsTable)
      .values({
        title: 'Tagged Novel',
        description: 'A novel with specific tags',
        author_id: userId,
        genre: 'Adventure',
        tags: ['dragons', 'magic', 'quest']
      })
      .execute();

    const results = await searchNovels('dragons', 10);

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Tagged Novel');
    expect(results[0].tags).toContain('dragons');
  });

  it('should limit search results', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'prolificauthor',
        email: 'prolific@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create multiple test novels
    const novels = Array.from({ length: 5 }, (_, i) => ({
      title: `Test Novel ${i + 1}`,
      description: 'A test story for searching',
      author_id: userId,
      genre: 'Test',
      tags: ['test']
    }));

    await db.insert(novelsTable)
      .values(novels)
      .execute();

    const results = await searchNovels('Test', 3);

    expect(results).toHaveLength(3);
  });

  it('should return empty array for no matches', async () => {
    const results = await searchNovels('nonexistentquery', 10);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should handle case insensitive search', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'caseauthor',
        email: 'case@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test novel
    await db.insert(novelsTable)
      .values({
        title: 'UPPERCASE TITLE',
        description: 'lowercase description',
        author_id: userId,
        genre: 'MixedCase',
        tags: ['CamelCase']
      })
      .execute();

    // Search with different cases
    const results1 = await searchNovels('uppercase', 10);
    const results2 = await searchNovels('LOWERCASE', 10);
    const results3 = await searchNovels('mixedcase', 10);

    expect(results1).toHaveLength(1);
    expect(results2).toHaveLength(1);
    expect(results3).toHaveLength(1);
  });
});
