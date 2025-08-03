
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123',
  role: 'reader'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with hashed password', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.username).toEqual('testuser');
    expect(result.email).toEqual('test@example.com');
    expect(result.role).toEqual('reader');
    expect(result.coins_balance).toEqual(0);
    expect(typeof result.coins_balance).toBe('number');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Password should be hashed, not plain text
    expect(result.password_hash).not.toEqual('testpassword123');
    expect(result.password_hash.length).toBeGreaterThan(20);

    // Default values should be set correctly
    expect(result.avatar_url).toBeNull();
    expect(result.bio).toBeNull();
    expect(result.is_active).toBe(true);
    expect(result.is_email_verified).toBe(false);
    expect(result.two_factor_enabled).toBe(false);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query the database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    const savedUser = users[0];
    expect(savedUser.username).toEqual('testuser');
    expect(savedUser.email).toEqual('test@example.com');
    expect(savedUser.role).toEqual('reader');
    expect(parseFloat(savedUser.coins_balance)).toEqual(0);
    expect(savedUser.created_at).toBeInstanceOf(Date);
  });

  it('should verify password can be verified with Bun', async () => {
    const result = await createUser(testInput);

    // Verify the hashed password can be verified with original password
    const isValid = await Bun.password.verify('testpassword123', result.password_hash);
    expect(isValid).toBe(true);

    // Verify wrong password fails
    const isInvalid = await Bun.password.verify('wrongpassword', result.password_hash);
    expect(isInvalid).toBe(false);
  });

  it('should create user with author role', async () => {
    const authorInput: CreateUserInput = {
      username: 'authoruser',
      email: 'author@example.com',
      password: 'authorpass123',
      role: 'author'
    };

    const result = await createUser(authorInput);

    expect(result.role).toEqual('author');
    expect(result.username).toEqual('authoruser');
    expect(result.email).toEqual('author@example.com');
  });

  it('should enforce unique username constraint', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create second user with same username
    const duplicateInput: CreateUserInput = {
      username: 'testuser', // Same username
      email: 'different@example.com',
      password: 'differentpass123',
      role: 'reader'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('should enforce unique email constraint', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create second user with same email
    const duplicateInput: CreateUserInput = {
      username: 'differentuser',
      email: 'test@example.com', // Same email
      password: 'differentpass123',
      role: 'reader'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });
});
