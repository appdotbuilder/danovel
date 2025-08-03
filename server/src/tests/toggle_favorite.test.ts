
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, readingProgressTable } from '../db/schema';
import { toggleFavorite } from '../handlers/toggle_favorite';
import { eq, and } from 'drizzle-orm';

describe('toggleFavorite', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should toggle favorite status from false to true', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: userId,
        genre: 'fiction'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    // Create test chapter
    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: novelId,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'This is chapter 1 content'
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    // Create reading progress with favorite = false
    await db.insert(readingProgressTable)
      .values({
        user_id: userId,
        novel_id: novelId,
        last_chapter_id: chapterId,
        is_favorite: false
      })
      .execute();

    const result = await toggleFavorite(userId, novelId);

    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual(userId);
    expect(result!.novel_id).toEqual(novelId);
    expect(result!.is_favorite).toBe(true);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should toggle favorite status from true to false', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: userId,
        genre: 'fiction'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    // Create test chapter
    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: novelId,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'This is chapter 1 content'
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    // Create reading progress with favorite = true
    await db.insert(readingProgressTable)
      .values({
        user_id: userId,
        novel_id: novelId,
        last_chapter_id: chapterId,
        is_favorite: true
      })
      .execute();

    const result = await toggleFavorite(userId, novelId);

    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual(userId);
    expect(result!.novel_id).toEqual(novelId);
    expect(result!.is_favorite).toBe(false);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when no reading progress exists', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: userId,
        genre: 'fiction'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    // No reading progress created
    const result = await toggleFavorite(userId, novelId);

    expect(result).toBeNull();
  });

  it('should update database correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: userId,
        genre: 'fiction'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    // Create test chapter
    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: novelId,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'This is chapter 1 content'
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    // Create reading progress with favorite = false
    await db.insert(readingProgressTable)
      .values({
        user_id: userId,
        novel_id: novelId,
        last_chapter_id: chapterId,
        is_favorite: false
      })
      .execute();

    await toggleFavorite(userId, novelId);

    // Verify database was updated
    const updatedProgress = await db.select()
      .from(readingProgressTable)
      .where(
        and(
          eq(readingProgressTable.user_id, userId),
          eq(readingProgressTable.novel_id, novelId)
        )
      )
      .execute();

    expect(updatedProgress).toHaveLength(1);
    expect(updatedProgress[0].is_favorite).toBe(true);
  });

  it('should throw error when user does not exist', async () => {
    // Create test novel with a valid author
    const userResult = await db.insert(usersTable)
      .values({
        username: 'author',
        email: 'author@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();
    const authorId = userResult[0].id;

    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: authorId,
        genre: 'fiction'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    const nonExistentUserId = 99999;

    await expect(toggleFavorite(nonExistentUserId, novelId)).rejects.toThrow(/user not found/i);
  });

  it('should throw error when novel does not exist', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const nonExistentNovelId = 99999;

    await expect(toggleFavorite(userId, nonExistentNovelId)).rejects.toThrow(/novel not found/i);
  });
});
