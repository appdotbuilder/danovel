
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, transactionsTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty stats when no data exists', async () => {
    const result = await getDashboardStats();

    expect(result.total_users).toBe(0);
    expect(result.total_novels).toBe(0);
    expect(result.total_chapters).toBe(0);
    expect(result.total_revenue).toBe(0);
    expect(result.active_users_today).toBe(0);
    expect(result.new_users_today).toBe(0);
    expect(result.popular_novels).toHaveLength(0);
    expect(result.recent_transactions).toHaveLength(0);
  });

  it('should return correct counts with sample data', async () => {
    // Create test users
    const usersResult = await db.insert(usersTable)
      .values([
        {
          username: 'author1',
          email: 'author1@test.com',
          password_hash: 'hash1',
          role: 'author',
          coins_balance: '100.00'
        },
        {
          username: 'reader1',
          email: 'reader1@test.com',
          password_hash: 'hash2',
          role: 'reader',
          coins_balance: '50.00'
        }
      ])
      .returning()
      .execute();

    // Create test novels
    const novelsResult = await db.insert(novelsTable)
      .values([
        {
          title: 'Popular Novel',
          description: 'A very popular novel',
          author_id: usersResult[0].id,
          genre: 'Fantasy',
          total_views: 1000,
          average_rating: '4.5'
        },
        {
          title: 'Less Popular Novel',
          description: 'A less popular novel',
          author_id: usersResult[0].id,
          genre: 'Romance',
          total_views: 100,
          average_rating: '3.8'
        }
      ])
      .returning()
      .execute();

    // Create test chapters
    await db.insert(chaptersTable)
      .values([
        {
          novel_id: novelsResult[0].id,
          chapter_number: 1,
          title: 'Chapter 1',
          content: 'Chapter content',
          coin_cost: '10.00'
        },
        {
          novel_id: novelsResult[1].id,
          chapter_number: 1,
          title: 'Chapter 1',
          content: 'Chapter content',
          coin_cost: '5.00'
        }
      ])
      .execute();

    // Create test transactions with slight delay to ensure ordering
    await db.insert(transactionsTable)
      .values({
        user_id: usersResult[1].id,
        type: 'purchase_coins',
        amount: '25.99',
        description: 'Purchased coins'
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        user_id: usersResult[1].id,
        type: 'unlock_chapter',
        amount: '10.00',
        description: 'Unlocked chapter',
        novel_id: novelsResult[0].id
      })
      .execute();

    const result = await getDashboardStats();

    // Verify basic counts
    expect(result.total_users).toBe(2);
    expect(result.total_novels).toBe(2);
    expect(result.total_chapters).toBe(2);
    
    // Verify revenue calculation (only purchase_coins transactions)
    expect(result.total_revenue).toBe(25.99);
    
    // Verify popular novels ordering (by total_views descending)
    expect(result.popular_novels).toHaveLength(2);
    expect(result.popular_novels[0].title).toBe('Popular Novel');
    expect(result.popular_novels[0].total_views).toBe(1000);
    expect(result.popular_novels[0].average_rating).toBe(4.5);
    expect(result.popular_novels[1].title).toBe('Less Popular Novel');
    expect(result.popular_novels[1].total_views).toBe(100);

    // Verify recent transactions (most recent first)
    expect(result.recent_transactions).toHaveLength(2);
    expect(result.recent_transactions[0].type).toBe('unlock_chapter');
    expect(result.recent_transactions[0].amount).toBe(10.00);
    expect(result.recent_transactions[1].type).toBe('purchase_coins');
    expect(result.recent_transactions[1].amount).toBe(25.99);
  });

  it('should handle users created today', async () => {
    // Create a user
    await db.insert(usersTable)
      .values({
        username: 'newuser',
        email: 'newuser@test.com',
        password_hash: 'hash',
        role: 'reader',
        coins_balance: '0.00'
      })
      .execute();

    const result = await getDashboardStats();

    expect(result.new_users_today).toBe(1);
    expect(result.total_users).toBe(1);
  });

  it('should handle active users today based on transactions', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'activeuser',
        email: 'active@test.com',
        password_hash: 'hash',
        role: 'reader',
        coins_balance: '50.00'
      })
      .returning()
      .execute();

    // Create transaction today
    await db.insert(transactionsTable)
      .values({
        user_id: userResult[0].id,
        type: 'purchase_coins',
        amount: '10.00',
        description: 'Purchase today'
      })
      .execute();

    const result = await getDashboardStats();

    expect(result.active_users_today).toBe(1);
  });

  it('should limit popular novels to 10 and recent transactions to 10', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@test.com',
        password_hash: 'hash',
        role: 'author',
        coins_balance: '0.00'
      })
      .returning()
      .execute();

    // Create 15 novels to test limit
    const novelValues = Array.from({ length: 15 }, (_, i) => ({
      title: `Novel ${i + 1}`,
      description: `Description ${i + 1}`,
      author_id: userResult[0].id,
      genre: 'Fantasy',
      total_views: 100 - i // Descending views for ordering test
    }));

    await db.insert(novelsTable)
      .values(novelValues)
      .execute();

    // Create 15 transactions to test limit
    const transactionValues = Array.from({ length: 15 }, (_, i) => ({
      user_id: userResult[0].id,
      type: 'purchase_coins' as const,
      amount: `${i + 1}.00`,
      description: `Transaction ${i + 1}`
    }));

    await db.insert(transactionsTable)
      .values(transactionValues)
      .execute();

    const result = await getDashboardStats();

    // Should limit to 10 items each
    expect(result.popular_novels).toHaveLength(10);
    expect(result.recent_transactions).toHaveLength(10);

    // Verify ordering
    expect(result.popular_novels[0].total_views).toBe(100);
    expect(result.popular_novels[9].total_views).toBe(91);
  });
});
