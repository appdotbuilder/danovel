
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, transactionsTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getTransactions } from '../handlers/get_transactions';
import { eq } from 'drizzle-orm';

// Test user inputs
const testUser1: CreateUserInput = {
  username: 'testuser1',
  email: 'test1@example.com',
  password: 'password123',
  role: 'reader'
};

const testUser2: CreateUserInput = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'password123',
  role: 'author'
};

describe('getTransactions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no transactions exist', async () => {
    const result = await getTransactions();

    expect(result).toEqual([]);
  });

  it('should return all transactions when no userId provided', async () => {
    // Create test users first
    const user1Result = await db.insert(usersTable)
      .values({
        username: testUser1.username,
        email: testUser1.email,
        password_hash: 'hashed_password_1',
        role: testUser1.role
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        username: testUser2.username,
        email: testUser2.email,
        password_hash: 'hashed_password_2',
        role: testUser2.role
      })
      .returning()
      .execute();

    const user1Id = user1Result[0].id;
    const user2Id = user2Result[0].id;

    // Create transactions one by one to ensure different timestamps
    await db.insert(transactionsTable)
      .values({
        user_id: user1Id,
        type: 'purchase_coins',
        amount: '10.00',
        description: 'Purchased 100 coins'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        user_id: user2Id,
        type: 'author_earning',
        amount: '5.50',
        description: 'Chapter unlock earning'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        user_id: user1Id,
        type: 'unlock_chapter',
        amount: '2.00',
        description: 'Unlocked chapter 5'
      })
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(3);
    
    // Verify numeric conversion
    expect(typeof result[0].amount).toBe('number');
    
    // Should be ordered by created_at desc (most recent first)
    expect(result[0].description).toEqual('Unlocked chapter 5');
    expect(result[1].description).toEqual('Chapter unlock earning');
    expect(result[2].description).toEqual('Purchased 100 coins');

    // Verify amounts are converted correctly
    expect(result[0].amount).toEqual(2.00);
    expect(result[1].amount).toEqual(5.50);
    expect(result[2].amount).toEqual(10.00);

    // Verify all transactions are included
    const descriptions = result.map(t => t.description);
    expect(descriptions).toContain('Purchased 100 coins');
    expect(descriptions).toContain('Chapter unlock earning');
    expect(descriptions).toContain('Unlocked chapter 5');
  });

  it('should return transactions for specific user when userId provided', async () => {
    // Create test users first
    const user1Result = await db.insert(usersTable)
      .values({
        username: testUser1.username,
        email: testUser1.email,
        password_hash: 'hashed_password_1',
        role: testUser1.role
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        username: testUser2.username,
        email: testUser2.email,
        password_hash: 'hashed_password_2',
        role: testUser2.role
      })
      .returning()
      .execute();

    const user1Id = user1Result[0].id;
    const user2Id = user2Result[0].id;

    // Create transactions one by one to ensure different timestamps
    await db.insert(transactionsTable)
      .values({
        user_id: user1Id,
        type: 'purchase_coins',
        amount: '10.00',
        description: 'User 1 coin purchase'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        user_id: user2Id,
        type: 'author_earning',
        amount: '5.50',
        description: 'User 2 earning'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        user_id: user1Id,
        type: 'unlock_chapter',
        amount: '2.00',
        description: 'User 1 chapter unlock'
      })
      .execute();

    const result = await getTransactions(user1Id);

    expect(result).toHaveLength(2);
    
    // All transactions should belong to user1
    result.forEach(transaction => {
      expect(transaction.user_id).toEqual(user1Id);
    });

    // Verify we got the right user's transactions (most recent first)
    expect(result[0].description).toEqual('User 1 chapter unlock');
    expect(result[1].description).toEqual('User 1 coin purchase');

    // Verify user2's transaction is not included
    const descriptions = result.map(t => t.description);
    expect(descriptions).not.toContain('User 2 earning');
  });

  it('should return empty array for user with no transactions', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: testUser1.username,
        email: testUser1.email,
        password_hash: 'hashed_password',
        role: testUser1.role
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const result = await getTransactions(userId);

    expect(result).toEqual([]);
  });

  it('should save transactions to database correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: testUser1.username,
        email: testUser1.email,
        password_hash: 'hashed_password',
        role: testUser1.role
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create transaction
    await db.insert(transactionsTable)
      .values({
        user_id: userId,
        type: 'purchase_coins',
        amount: '15.75',
        description: 'Test transaction'
      })
      .execute();

    const result = await getTransactions(userId);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].type).toEqual('purchase_coins');
    expect(result[0].amount).toEqual(15.75);
    expect(result[0].description).toEqual('Test transaction');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();

    // Verify data was saved correctly in database
    const dbTransactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.user_id, userId))
      .execute();

    expect(dbTransactions).toHaveLength(1);
    expect(parseFloat(dbTransactions[0].amount)).toEqual(15.75);
  });
});
