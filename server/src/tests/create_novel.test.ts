
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { novelsTable, usersTable } from '../db/schema';
import { type CreateNovelInput } from '../schema';
import { createNovel } from '../handlers/create_novel';
import { eq } from 'drizzle-orm';

const testInput: CreateNovelInput = {
  title: 'Test Novel',
  description: 'A novel for testing purposes with enough content',
  cover_url: 'https://example.com/cover.jpg',
  genre: 'Fantasy',
  tags: ['magic', 'adventure']
};

describe('createNovel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let authorId: number;
  let readerId: number;

  beforeEach(async () => {
    // Create test author
    const authorResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();
    authorId = authorResult[0].id;

    // Create test reader (non-author)
    const readerResult = await db.insert(usersTable)
      .values({
        username: 'testreader',
        email: 'reader@test.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();
    readerId = readerResult[0].id;
  });

  it('should create a novel successfully', async () => {
    const result = await createNovel(testInput, authorId);

    expect(result.title).toEqual('Test Novel');
    expect(result.description).toEqual(testInput.description);
    expect(result.cover_url).toEqual('https://example.com/cover.jpg');
    expect(result.author_id).toEqual(authorId);
    expect(result.genre).toEqual('Fantasy');
    expect(result.tags).toEqual(['magic', 'adventure']);
    expect(result.status).toEqual('draft');
    expect(result.total_chapters).toEqual(0);
    expect(result.total_views).toEqual(0);
    expect(result.total_likes).toEqual(0);
    expect(result.average_rating).toEqual(0);
    expect(result.is_featured).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(typeof result.average_rating).toBe('number');
  });

  it('should save novel to database', async () => {
    const result = await createNovel(testInput, authorId);

    const novels = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, result.id))
      .execute();

    expect(novels).toHaveLength(1);
    expect(novels[0].title).toEqual('Test Novel');
    expect(novels[0].author_id).toEqual(authorId);
    expect(novels[0].genre).toEqual('Fantasy');
    expect(parseFloat(novels[0].average_rating)).toEqual(0);
    expect(novels[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle novel without cover_url', async () => {
    const inputWithoutCover = {
      ...testInput,
      cover_url: undefined
    };

    const result = await createNovel(inputWithoutCover, authorId);

    expect(result.cover_url).toBeNull();
    expect(result.title).toEqual('Test Novel');
  });

  it('should handle empty tags array', async () => {
    const inputWithEmptyTags = {
      ...testInput,
      tags: []
    };

    const result = await createNovel(inputWithEmptyTags, authorId);

    expect(result.tags).toEqual([]);
    expect(Array.isArray(result.tags)).toBe(true);
  });

  it('should throw error when author does not exist', async () => {
    const nonExistentAuthorId = 99999;

    await expect(createNovel(testInput, nonExistentAuthorId))
      .rejects.toThrow(/author not found/i);
  });

  it('should throw error when user is not an author', async () => {
    await expect(createNovel(testInput, readerId))
      .rejects.toThrow(/does not have permission/i);
  });

  it('should throw error when author account is inactive', async () => {
    // Deactivate author account
    await db.update(usersTable)
      .set({ is_active: false })
      .where(eq(usersTable.id, authorId))
      .execute();

    await expect(createNovel(testInput, authorId))
      .rejects.toThrow(/account is not active/i);
  });

  it('should allow admin to create novels', async () => {
    // Create admin user
    const adminResult = await db.insert(usersTable)
      .values({
        username: 'testadmin',
        email: 'admin@test.com',
        password_hash: 'hashedpassword',
        role: 'admin'
      })
      .returning()
      .execute();
    const adminId = adminResult[0].id;

    const result = await createNovel(testInput, adminId);

    expect(result.author_id).toEqual(adminId);
    expect(result.title).toEqual('Test Novel');
  });
});
