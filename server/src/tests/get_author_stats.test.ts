
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, transactionsTable } from '../db/schema';
import { getAuthorStats } from '../handlers/get_author_stats';

describe('getAuthorStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty stats for author with no novels', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const stats = await getAuthorStats(userId);

    expect(stats.novels).toHaveLength(0);
    expect(stats.total_views).toBe(0);
    expect(stats.total_earnings).toBe(0);
    expect(stats.recent_transactions).toHaveLength(0);
  });

  it('should return correct stats for author with novels and earnings', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();

    const authorId = userResult[0].id;

    // Create first novel
    const firstNovelResult = await db.insert(novelsTable)
      .values({
        title: 'Novel One',
        description: 'First novel description',
        author_id: authorId,
        genre: 'Fantasy',
        tags: JSON.stringify(['magic', 'adventure']),
        total_views: 1000,
        average_rating: '4.5'
      })
      .returning()
      .execute();

    // Create second novel (will have later created_at)
    const secondNovelResult = await db.insert(novelsTable)
      .values({
        title: 'Novel Two',
        description: 'Second novel description',
        author_id: authorId,
        genre: 'Romance',
        tags: JSON.stringify(['love', 'drama']),
        total_views: 500,
        average_rating: '3.8'
      })
      .returning()
      .execute();

    // Create first transaction
    const firstTransactionResult = await db.insert(transactionsTable)
      .values({
        user_id: authorId,
        type: 'author_earning',
        amount: '25.50',
        description: 'Chapter unlock earnings'
      })
      .returning()
      .execute();

    // Create second transaction (will have later created_at)
    const secondTransactionResult = await db.insert(transactionsTable)
      .values({
        user_id: authorId,
        type: 'author_earning',
        amount: '15.75',
        description: 'Monthly earnings'
      })
      .returning()
      .execute();

    const stats = await getAuthorStats(authorId);

    // Verify novels
    expect(stats.novels).toHaveLength(2);
    expect(stats.novels[0].title).toBe('Novel Two'); // Most recent first
    expect(stats.novels[0].total_views).toBe(500);
    expect(stats.novels[0].average_rating).toBe(3.8);
    expect(stats.novels[0].tags).toEqual(['love', 'drama']);

    expect(stats.novels[1].title).toBe('Novel One');
    expect(stats.novels[1].total_views).toBe(1000);
    expect(stats.novels[1].average_rating).toBe(4.5);
    expect(stats.novels[1].tags).toEqual(['magic', 'adventure']);

    // Verify total views (sum of all novels)
    expect(stats.total_views).toBe(1500);

    // Verify total earnings
    expect(stats.total_earnings).toBe(41.25);

    // Verify recent transactions
    expect(stats.recent_transactions).toHaveLength(2);
    expect(stats.recent_transactions[0].amount).toBe(15.75); // Most recent first
    expect(stats.recent_transactions[1].amount).toBe(25.50);
    expect(stats.recent_transactions[0].type).toBe('author_earning');
  });

  it('should only include author earnings transactions', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();

    const authorId = userResult[0].id;

    // Create mixed transaction types
    await db.insert(transactionsTable)
      .values([
        {
          user_id: authorId,
          type: 'author_earning',
          amount: '20.00',
          description: 'Author earnings'
        },
        {
          user_id: authorId,
          type: 'purchase_coins',
          amount: '10.00',
          description: 'Coin purchase'
        },
        {
          user_id: authorId,
          type: 'unlock_chapter',
          amount: '5.00',
          description: 'Chapter unlock'
        }
      ])
      .execute();

    const stats = await getAuthorStats(authorId);

    // Should only include author_earning transactions
    expect(stats.total_earnings).toBe(20.00);
    expect(stats.recent_transactions).toHaveLength(1);
    expect(stats.recent_transactions[0].type).toBe('author_earning');
    expect(stats.recent_transactions[0].amount).toBe(20.00);
  });

  it('should handle novels with empty tags correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();

    const authorId = userResult[0].id;

    // Create novel with empty tags
    await db.insert(novelsTable)
      .values({
        title: 'Novel with Empty Tags',
        description: 'Novel description',
        author_id: authorId,
        genre: 'Sci-Fi',
        tags: JSON.stringify([]),
        total_views: 100,
        average_rating: '0'
      })
      .execute();

    const stats = await getAuthorStats(authorId);

    expect(stats.novels).toHaveLength(1);
    expect(stats.novels[0].tags).toEqual([]);
    expect(stats.novels[0].average_rating).toBe(0);
    expect(stats.total_views).toBe(100);
  });
});
