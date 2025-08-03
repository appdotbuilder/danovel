
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, transactionsTable } from '../db/schema';
import { unlockChapter } from '../handlers/unlock_chapter';
import { eq } from 'drizzle-orm';

describe('unlockChapter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should unlock chapter and deduct coins', async () => {
    // Create test user with coins
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpass',
        coins_balance: '100.00'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'Test description',
        author_id: userId,
        genre: 'fantasy'
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
        content: 'Test content',
        coin_cost: '10.00',
        is_free: false
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    const result = await unlockChapter(userId, chapterId, 10);

    // Verify transaction details
    expect(result.user_id).toBe(userId);
    expect(result.type).toBe('unlock_chapter');
    expect(result.amount).toBe(-10);
    expect(result.description).toBe(`Unlocked chapter ${chapterId}`);
    expect(result.novel_id).toBe(novelId);
    expect(result.chapter_id).toBe(chapterId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(typeof result.amount).toBe('number');
  });

  it('should update user coin balance', async () => {
    // Create test user with coins
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpass',
        coins_balance: '50.50'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'Test description',
        author_id: userId,
        genre: 'fantasy'
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
        content: 'Test content',
        coin_cost: '15.25',
        is_free: false
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    await unlockChapter(userId, chapterId, 15.25);

    // Verify user balance was updated
    const updatedUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(updatedUsers).toHaveLength(1);
    expect(parseFloat(updatedUsers[0].coins_balance)).toBe(35.25);
  });

  it('should save transaction to database', async () => {
    // Create test user with coins
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpass',
        coins_balance: '100.00'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'Test description',
        author_id: userId,
        genre: 'fantasy'
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
        content: 'Test content',
        coin_cost: '25.00',
        is_free: false
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    const result = await unlockChapter(userId, chapterId, 25);

    // Query database to verify transaction was saved
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, result.id))
      .execute();

    expect(transactions).toHaveLength(1);
    const savedTransaction = transactions[0];
    expect(savedTransaction.user_id).toBe(userId);
    expect(savedTransaction.type).toBe('unlock_chapter');
    expect(parseFloat(savedTransaction.amount)).toBe(-25);
    expect(savedTransaction.description).toBe(`Unlocked chapter ${chapterId}`);
    expect(savedTransaction.novel_id).toBe(novelId);
    expect(savedTransaction.chapter_id).toBe(chapterId);
    expect(savedTransaction.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when user not found', async () => {
    const nonExistentUserId = 999;
    const chapterId = 1;

    await expect(unlockChapter(nonExistentUserId, chapterId, 10))
      .rejects.toThrow(/user not found/i);
  });

  it('should throw error when chapter not found', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpass',
        coins_balance: '100.00'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const nonExistentChapterId = 999;

    await expect(unlockChapter(userId, nonExistentChapterId, 10))
      .rejects.toThrow(/chapter not found/i);
  });

  it('should throw error when insufficient coins', async () => {
    // Create test user with insufficient coins
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpass',
        coins_balance: '5.00'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'Test description',
        author_id: userId,
        genre: 'fantasy'
      })
      .returning()
      .execute();
    const novelId = novelResult[0].id;

    // Create test chapter with high cost
    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: novelId,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Test content',
        coin_cost: '20.00',
        is_free: false
      })
      .returning()
      .execute();
    const chapterId = chapterResult[0].id;

    await expect(unlockChapter(userId, chapterId, 20))
      .rejects.toThrow(/insufficient coins/i);
  });
});
