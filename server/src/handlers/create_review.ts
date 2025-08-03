
import { db } from '../db';
import { reviewsTable, novelsTable } from '../db/schema';
import { type CreateReviewInput, type Review } from '../schema';
import { eq, avg } from 'drizzle-orm';

export async function createReview(input: CreateReviewInput, userId: number): Promise<Review> {
  try {
    // Verify the novel exists
    const novel = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, input.novel_id))
      .execute();

    if (novel.length === 0) {
      throw new Error('Novel not found');
    }

    // Insert the review
    const reviewResult = await db.insert(reviewsTable)
      .values({
        novel_id: input.novel_id,
        user_id: userId,
        rating: input.rating,
        review_text: input.review_text || null
      })
      .returning()
      .execute();

    const review = reviewResult[0];

    // Calculate the new average rating for the novel
    const avgResult = await db.select({
      average_rating: avg(reviewsTable.rating)
    })
      .from(reviewsTable)
      .where(eq(reviewsTable.novel_id, input.novel_id))
      .execute();

    const newAverageRating = avgResult[0]?.average_rating || 0;

    // Update the novel's average rating
    await db.update(novelsTable)
      .set({
        average_rating: newAverageRating.toString(),
        updated_at: new Date()
      })
      .where(eq(novelsTable.id, input.novel_id))
      .execute();

    return review;
  } catch (error) {
    console.error('Review creation failed:', error);
    throw error;
  }
}
