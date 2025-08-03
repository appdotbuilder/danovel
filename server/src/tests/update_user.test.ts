
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Helper to create a test user
const createTestUser = async (): Promise<number> => {
  const result = await db.insert(usersTable)
    .values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed_password_123',
      role: 'reader',
      coins_balance: '100.50'
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'updateduser',
      email: 'updated@example.com',
      role: 'author',
      bio: 'Updated bio',
      is_active: false,
      two_factor_enabled: true
    };

    const result = await updateUser(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(userId);
    expect(result!.username).toEqual('updateduser');
    expect(result!.email).toEqual('updated@example.com');
    expect(result!.role).toEqual('author');
    expect(result!.bio).toEqual('Updated bio');
    expect(result!.is_active).toEqual(false);
    expect(result!.two_factor_enabled).toEqual(true);
    expect(result!.coins_balance).toEqual(100.5);
    expect(typeof result!.coins_balance).toEqual('number');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated user to database', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'newusername',
      role: 'admin'
    };

    await updateUser(updateInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('newusername');
    expect(users[0].role).toEqual('admin');
    expect(users[0].email).toEqual('test@example.com'); // Unchanged
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      bio: 'Just updating bio'
    };

    const result = await updateUser(updateInput);

    expect(result).not.toBeNull();
    expect(result!.bio).toEqual('Just updating bio');
    expect(result!.username).toEqual('testuser'); // Unchanged
    expect(result!.email).toEqual('test@example.com'); // Unchanged
    expect(result!.role).toEqual('reader'); // Unchanged
  });

  it('should handle nullable fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      avatar_url: 'https://example.com/avatar.jpg',
      bio: null
    };

    const result = await updateUser(updateInput);

    expect(result).not.toBeNull();
    expect(result!.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result!.bio).toBeNull();
  });

  it('should return null for non-existent user', async () => {
    const updateInput: UpdateUserInput = {
      id: 999999,
      username: 'nonexistent'
    };

    const result = await updateUser(updateInput);

    expect(result).toBeNull();
  });

  it('should handle role changes correctly', async () => {
    const userId = await createTestUser();

    // Update to author
    let updateInput: UpdateUserInput = {
      id: userId,
      role: 'author'
    };

    let result = await updateUser(updateInput);
    expect(result!.role).toEqual('author');

    // Update to admin
    updateInput = {
      id: userId,
      role: 'admin'
    };

    result = await updateUser(updateInput);
    expect(result!.role).toEqual('admin');
  });

  it('should preserve unchanged numeric fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'newname'
    };

    const result = await updateUser(updateInput);

    expect(result).not.toBeNull();
    expect(result!.coins_balance).toEqual(100.5);
    expect(typeof result!.coins_balance).toEqual('number');
  });

  it('should update updated_at timestamp', async () => {
    const userId = await createTestUser();

    // Get original updated_at
    const originalUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    const originalUpdatedAt = originalUser[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'updated'
    };

    const result = await updateUser(updateInput);

    expect(result).not.toBeNull();
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
