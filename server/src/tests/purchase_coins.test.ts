
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, transactionsTable } from '../db/schema';
import { type PurchaseCoinsInput } from '../schema';
import { purchaseCoins } from '../handlers/purchase_coins';
import { eq } from 'drizzle-orm';

// Test input
const testInput: PurchaseCoinsInput = {
  amount: 100,
  description: 'Test coin purchase'
};

describe('purchaseCoins', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should purchase coins and update user balance', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader',
        coins_balance: '50.00'
      })
      .returning()
      .execute();

    const user = userResult[0];
    const result = await purchaseCoins(user.id, testInput);

    // Verify transaction details
    expect(result.user_id).toEqual(user.id);
    expect(result.type).toEqual('purchase_coins');
    expect(result.amount).toEqual(100);
    expect(result.description).toEqual('Test coin purchase');
    expect(result.novel_id).toBeNull();
    expect(result.chapter_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update user coin balance correctly', async () => {
    // Create test user with initial balance
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader',
        coins_balance: '25.50'
      })
      .returning()
      .execute();

    const user = userResult[0];
    await purchaseCoins(user.id, testInput);

    // Check updated balance
    const updatedUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .execute();

    expect(updatedUsers).toHaveLength(1);
    expect(parseFloat(updatedUsers[0].coins_balance)).toEqual(125.50); // 25.50 + 100
    expect(updatedUsers[0].updated_at).toBeInstanceOf(Date);
  });

  it('should save transaction to database', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader',
        coins_balance: '0.00'
      })
      .returning()
      .execute();

    const user = userResult[0];
    const result = await purchaseCoins(user.id, testInput);

    // Verify transaction is saved
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, result.id))
      .execute();

    expect(transactions).toHaveLength(1);
    expect(transactions[0].user_id).toEqual(user.id);
    expect(transactions[0].type).toEqual('purchase_coins');
    expect(parseFloat(transactions[0].amount)).toEqual(100);
    expect(transactions[0].description).toEqual('Test coin purchase');
    expect(transactions[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    await expect(purchaseCoins(999, testInput)).rejects.toThrow(/user not found/i);
  });

  it('should handle decimal amounts correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader',
        coins_balance: '10.25'
      })
      .returning()
      .execute();

    const user = userResult[0];
    const decimalInput: PurchaseCoinsInput = {
      amount: 15.75,
      description: 'Decimal coin purchase'
    };

    const result = await purchaseCoins(user.id, decimalInput);

    // Verify transaction amount is correct
    expect(result.amount).toEqual(15.75);
    expect(typeof result.amount).toBe('number');

    // Check updated balance
    const updatedUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .execute();

    expect(parseFloat(updatedUsers[0].coins_balance)).toEqual(26.00); // 10.25 + 15.75
  });
});
