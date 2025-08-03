
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, reviewsTable } from '../db/schema';
import { getReviews } from '../handlers/get_reviews';

describe('getReviews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no reviews exist', async () => {
    // Create a user first
    const [user] = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create a novel without reviews
    const [novel] = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A novel for testing',
      author_id: user.id,
      genre: 'Fantasy'
    }).returning().execute();

    const result = await getReviews(novel.id);

    expect(result).toEqual([]);
  });

  it('should return reviews for a specific novel', async () => {
    // Create test user
    const [user] = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create test novel
    const [novel] = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A novel for testing',
      author_id: user.id,
      genre: 'Fantasy'
    }).returning().execute();

    // Create test reviews
    const [review1] = await db.insert(reviewsTable).values({
      novel_id: novel.id,
      user_id: user.id,
      rating: 5,
      review_text: 'Great novel!'
    }).returning().execute();

    const [review2] = await db.insert(reviewsTable).values({
      novel_id: novel.id,
      user_id: user.id,
      rating: 4,
      review_text: 'Good read'
    }).returning().execute();

    const result = await getReviews(novel.id);

    expect(result).toHaveLength(2);
    
    // Check first review
    const foundReview1 = result.find(r => r.id === review1.id);
    expect(foundReview1).toBeDefined();
    expect(foundReview1!.novel_id).toEqual(novel.id);
    expect(foundReview1!.user_id).toEqual(user.id);
    expect(foundReview1!.rating).toEqual(5);
    expect(foundReview1!.review_text).toEqual('Great novel!');
    expect(foundReview1!.created_at).toBeInstanceOf(Date);
    expect(foundReview1!.updated_at).toBeInstanceOf(Date);

    // Check second review
    const foundReview2 = result.find(r => r.id === review2.id);
    expect(foundReview2).toBeDefined();
    expect(foundReview2!.rating).toEqual(4);
    expect(foundReview2!.review_text).toEqual('Good read');
  });

  it('should only return reviews for the specified novel', async () => {
    // Create test users
    const [user1] = await db.insert(usersTable).values({
      username: 'user1',
      email: 'user1@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    const [user2] = await db.insert(usersTable).values({
      username: 'user2',
      email: 'user2@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create two novels
    const [novel1] = await db.insert(novelsTable).values({
      title: 'Novel 1',
      description: 'First novel',
      author_id: user1.id,
      genre: 'Fantasy'
    }).returning().execute();

    const [novel2] = await db.insert(novelsTable).values({
      title: 'Novel 2',
      description: 'Second novel',
      author_id: user2.id,
      genre: 'Romance'
    }).returning().execute();

    // Create reviews for both novels
    await db.insert(reviewsTable).values({
      novel_id: novel1.id,
      user_id: user1.id,
      rating: 5,
      review_text: 'Review for novel 1'
    }).execute();

    await db.insert(reviewsTable).values({
      novel_id: novel2.id,
      user_id: user2.id,
      rating: 3,
      review_text: 'Review for novel 2'
    }).execute();

    // Should only return reviews for novel1
    const result = await getReviews(novel1.id);

    expect(result).toHaveLength(1);
    expect(result[0].novel_id).toEqual(novel1.id);
    expect(result[0].review_text).toEqual('Review for novel 1');
  });

  it('should handle reviews with null review_text', async () => {
    // Create test user
    const [user] = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create test novel
    const [novel] = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A novel for testing',
      author_id: user.id,
      genre: 'Fantasy'
    }).returning().execute();

    // Create review with null text
    const [review] = await db.insert(reviewsTable).values({
      novel_id: novel.id,
      user_id: user.id,
      rating: 4,
      review_text: null
    }).returning().execute();

    const result = await getReviews(novel.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(review.id);
    expect(result[0].rating).toEqual(4);
    expect(result[0].review_text).toBeNull();
  });
});
