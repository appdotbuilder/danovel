
import { db } from '../db';
import { reviewsTable, usersTable } from '../db/schema';
import { type Review } from '../schema';
import { eq } from 'drizzle-orm';

export async function getReviews(novelId: number): Promise<Review[]> {
  try {
    // Query reviews with user information joined
    const results = await db.select({
      id: reviewsTable.id,
      novel_id: reviewsTable.novel_id,
      user_id: reviewsTable.user_id,
      rating: reviewsTable.rating,
      review_text: reviewsTable.review_text,
      created_at: reviewsTable.created_at,
      updated_at: reviewsTable.updated_at
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.user_id, usersTable.id))
    .where(eq(reviewsTable.novel_id, novelId))
    .execute();

    // Return reviews with proper type conversion
    return results.map(review => ({
      ...review,
      rating: review.rating, // integer - no conversion needed
      created_at: review.created_at,
      updated_at: review.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
}
