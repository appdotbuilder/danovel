
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, reviewsTable } from '../db/schema';
import { type CreateReviewInput } from '../schema';
import { createReview } from '../handlers/create_review';
import { eq } from 'drizzle-orm';

describe('createReview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testNovelId: number;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create test author
    const authorResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@example.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A novel for testing reviews',
        author_id: authorResult[0].id,
        genre: 'Fantasy',
        tags: ['test', 'fantasy']
      })
      .returning()
      .execute();
    testNovelId = novelResult[0].id;
  });

  const testInput: CreateReviewInput = {
    novel_id: 0, // Will be set in tests
    rating: 4,
    review_text: 'Great story with compelling characters!'
  };

  it('should create a review successfully', async () => {
    const input = { ...testInput, novel_id: testNovelId };
    const result = await createReview(input, testUserId);

    expect(result.novel_id).toEqual(testNovelId);
    expect(result.user_id).toEqual(testUserId);
    expect(result.rating).toEqual(4);
    expect(result.review_text).toEqual('Great story with compelling characters!');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save review to database', async () => {
    const input = { ...testInput, novel_id: testNovelId };
    const result = await createReview(input, testUserId);

    const reviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, result.id))
      .execute();

    expect(reviews).toHaveLength(1);
    expect(reviews[0].novel_id).toEqual(testNovelId);
    expect(reviews[0].user_id).toEqual(testUserId);
    expect(reviews[0].rating).toEqual(4);
    expect(reviews[0].review_text).toEqual('Great story with compelling characters!');
  });

  it('should update novel average rating with single review', async () => {
    const input = { ...testInput, novel_id: testNovelId };
    await createReview(input, testUserId);

    const novels = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, testNovelId))
      .execute();

    expect(novels).toHaveLength(1);
    expect(parseFloat(novels[0].average_rating)).toEqual(4);
  });

  it('should update novel average rating with multiple reviews', async () => {
    // Create another user for second review
    const user2Result = await db.insert(usersTable)
      .values({
        username: 'testuser2',
        email: 'test2@example.com',
        password_hash: 'hashedpassword',
        role: 'reader'
      })
      .returning()
      .execute();

    // First review (rating: 4)
    const input1 = { ...testInput, novel_id: testNovelId };
    await createReview(input1, testUserId);

    // Second review (rating: 2)
    const input2 = { ...testInput, novel_id: testNovelId, rating: 2 };
    await createReview(input2, user2Result[0].id);

    const novels = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, testNovelId))
      .execute();

    expect(novels).toHaveLength(1);
    // Average of 4 and 2 should be 3
    expect(parseFloat(novels[0].average_rating)).toEqual(3);
  });

  it('should handle review without text', async () => {
    const input = {
      novel_id: testNovelId,
      rating: 5
    };
    const result = await createReview(input, testUserId);

    expect(result.rating).toEqual(5);
    expect(result.review_text).toBeNull();
  });

  it('should throw error for non-existent novel', async () => {
    const input = { ...testInput, novel_id: 99999 };

    expect(createReview(input, testUserId)).rejects.toThrow(/novel not found/i);
  });

  it('should update novel updated_at timestamp', async () => {
    // Get initial timestamp
    const initialNovel = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, testNovelId))
      .execute();

    const initialUpdatedAt = initialNovel[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input = { ...testInput, novel_id: testNovelId };
    await createReview(input, testUserId);

    const updatedNovel = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, testNovelId))
      .execute();

    expect(updatedNovel[0].updated_at.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
  });
});
