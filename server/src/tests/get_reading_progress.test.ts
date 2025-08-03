
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, readingProgressTable } from '../db/schema';
import { getReadingProgress } from '../handlers/get_reading_progress';

describe('getReadingProgress', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no reading progress', async () => {
    // Create a user with no reading progress
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();

    const result = await getReadingProgress(userResult[0].id);
    expect(result).toEqual([]);
  });

  it('should return reading progress for user', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create author
    const authorResult = await db.insert(usersTable)
      .values({
        username: 'author',
        email: 'author@example.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();
    const authorId = authorResult[0].id;

    // Create novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel for reading progress',
        author_id: authorId,
        genre: 'fantasy'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    // Create chapter
    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: novelId,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'This is the first chapter content'
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    // Create reading progress
    const progressResult = await db.insert(readingProgressTable)
      .values({
        user_id: userId,
        novel_id: novelId,
        last_chapter_id: chapterId,
        is_favorite: true
      })
      .returning()
      .execute();

    const result = await getReadingProgress(userId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(progressResult[0].id);
    expect(result[0].user_id).toBe(userId);
    expect(result[0].novel_id).toBe(novelId);
    expect(result[0].last_chapter_id).toBe(chapterId);
    expect(result[0].is_favorite).toBe(true);
    expect(result[0].last_read_at).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple reading progress entries', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create author
    const authorResult = await db.insert(usersTable)
      .values({
        username: 'author',
        email: 'author@example.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();
    const authorId = authorResult[0].id;

    // Create first novel
    const novel1Result = await db.insert(novelsTable)
      .values({
        title: 'First Novel',
        description: 'First test novel',
        author_id: authorId,
        genre: 'fantasy'
      })
      .returning()
      .execute();

    // Create second novel
    const novel2Result = await db.insert(novelsTable)
      .values({
        title: 'Second Novel',
        description: 'Second test novel',
        author_id: authorId,
        genre: 'sci-fi'
      })
      .returning()
      .execute();

    // Create chapters for both novels
    const chapter1Result = await db.insert(chaptersTable)
      .values({
        novel_id: novel1Result[0].id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'First novel chapter content'
      })
      .returning()
      .execute();

    const chapter2Result = await db.insert(chaptersTable)
      .values({
        novel_id: novel2Result[0].id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Second novel chapter content'
      })
      .returning()
      .execute();

    // Create reading progress for both novels
    await db.insert(readingProgressTable)
      .values([
        {
          user_id: userId,
          novel_id: novel1Result[0].id,
          last_chapter_id: chapter1Result[0].id,
          is_favorite: true
        },
        {
          user_id: userId,
          novel_id: novel2Result[0].id,
          last_chapter_id: chapter2Result[0].id,
          is_favorite: false
        }
      ])
      .execute();

    const result = await getReadingProgress(userId);

    expect(result).toHaveLength(2);
    
    // Verify both progress entries exist
    const novelIds = result.map(p => p.novel_id);
    expect(novelIds).toContain(novel1Result[0].id);
    expect(novelIds).toContain(novel2Result[0].id);

    // Verify structure of entries
    result.forEach(progress => {
      expect(progress.user_id).toBe(userId);
      expect(progress.id).toBeDefined();
      expect(progress.last_read_at).toBeInstanceOf(Date);
      expect(progress.created_at).toBeInstanceOf(Date);
      expect(progress.updated_at).toBeInstanceOf(Date);
      expect(typeof progress.is_favorite).toBe('boolean');
    });
  });

  it('should only return progress for specified user', async () => {
    // Create two users
    const user1Result = await db.insert(usersTable)
      .values({
        username: 'user1',
        email: 'user1@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        username: 'user2',
        email: 'user2@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();

    // Create author
    const authorResult = await db.insert(usersTable)
      .values({
        username: 'author',
        email: 'author@example.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    // Create novel and chapter
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: authorResult[0].id,
        genre: 'fantasy'
      })
      .returning()
      .execute();

    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: novelResult[0].id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Chapter content'
      })
      .returning()
      .execute();

    // Create reading progress for both users
    await db.insert(readingProgressTable)
      .values([
        {
          user_id: user1Result[0].id,
          novel_id: novelResult[0].id,
          last_chapter_id: chapterResult[0].id
        },
        {
          user_id: user2Result[0].id,
          novel_id: novelResult[0].id,
          last_chapter_id: chapterResult[0].id
        }
      ])
      .execute();

    // Get progress for user1 only
    const result = await getReadingProgress(user1Result[0].id);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe(user1Result[0].id);
  });
});
