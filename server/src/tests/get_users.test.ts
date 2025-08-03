
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUsersQuery } from '../schema';
import { getUsers } from '../handlers/get_users';

// Test users data
const testUsers = [
  {
    username: 'admin1',
    email: 'admin@example.com',
    password_hash: 'hashed_password',
    role: 'admin' as const,
    is_active: true,
    coins_balance: '100.50'
  },
  {
    username: 'author1',
    email: 'author@example.com',
    password_hash: 'hashed_password',
    role: 'author' as const,
    is_active: true,
    coins_balance: '50.25'
  },
  {
    username: 'reader1',
    email: 'reader@example.com',
    password_hash: 'hashed_password',
    role: 'reader' as const,
    is_active: false,
    coins_balance: '25.75'
  },
  {
    username: 'reader2',
    email: 'reader2@example.com',
    password_hash: 'hashed_password',
    role: 'reader' as const,
    is_active: true,
    coins_balance: '0.00'
  }
];

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get all users with default pagination', async () => {
    // Create test users
    await db.insert(usersTable).values(testUsers).execute();

    const query: GetUsersQuery = {
      limit: 50,
      offset: 0
    };

    const result = await getUsers(query);

    expect(result).toHaveLength(4);
    expect(result[0].username).toBe('admin1');
    expect(result[0].role).toBe('admin');
    expect(result[0].is_active).toBe(true);
    expect(typeof result[0].coins_balance).toBe('number');
    expect(result[0].coins_balance).toBe(100.50);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter users by role', async () => {
    // Create test users
    await db.insert(usersTable).values(testUsers).execute();

    const query: GetUsersQuery = {
      role: 'reader',
      limit: 50,
      offset: 0
    };

    const result = await getUsers(query);

    expect(result).toHaveLength(2);
    result.forEach(user => {
      expect(user.role).toBe('reader');
    });
  });

  it('should filter users by active status', async () => {
    // Create test users
    await db.insert(usersTable).values(testUsers).execute();

    const query: GetUsersQuery = {
      is_active: true,
      limit: 50,
      offset: 0
    };

    const result = await getUsers(query);

    expect(result).toHaveLength(3);
    result.forEach(user => {
      expect(user.is_active).toBe(true);
    });
  });

  it('should filter users by both role and active status', async () => {
    // Create test users
    await db.insert(usersTable).values(testUsers).execute();

    const query: GetUsersQuery = {
      role: 'reader',
      is_active: true,
      limit: 50,
      offset: 0
    };

    const result = await getUsers(query);

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('reader');
    expect(result[0].is_active).toBe(true);
    expect(result[0].username).toBe('reader2');
  });

  it('should handle pagination correctly', async () => {
    // Create test users
    await db.insert(usersTable).values(testUsers).execute();

    // Get first page with limit 2
    const firstPageQuery: GetUsersQuery = {
      limit: 2,
      offset: 0
    };

    const firstPage = await getUsers(firstPageQuery);
    expect(firstPage).toHaveLength(2);

    // Get second page with limit 2
    const secondPageQuery: GetUsersQuery = {
      limit: 2,
      offset: 2
    };

    const secondPage = await getUsers(secondPageQuery);
    expect(secondPage).toHaveLength(2);

    // Ensure no overlap between pages
    const firstPageIds = firstPage.map(u => u.id);
    const secondPageIds = secondPage.map(u => u.id);
    expect(firstPageIds).not.toEqual(secondPageIds);
  });

  it('should return empty array when no users match filters', async () => {
    // Create test users
    await db.insert(usersTable).values(testUsers).execute();

    const query: GetUsersQuery = {
      role: 'visitor',
      limit: 50,
      offset: 0
    };

    const result = await getUsers(query);
    expect(result).toHaveLength(0);
  });

  it('should handle numeric conversion for coins_balance', async () => {
    // Create a user with specific coin balance
    await db.insert(usersTable).values([testUsers[0]]).execute();

    const query: GetUsersQuery = {
      limit: 50,
      offset: 0
    };

    const result = await getUsers(query);

    expect(result).toHaveLength(1);
    expect(typeof result[0].coins_balance).toBe('number');
    expect(result[0].coins_balance).toBe(100.50);
  });
});
