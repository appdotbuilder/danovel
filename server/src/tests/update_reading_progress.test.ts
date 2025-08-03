
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, readingProgressTable } from '../db/schema';
import { updateReadingProgress } from '../handlers/update_reading_progress';
import { eq, and } from 'drizzle-orm';

describe('updateReadingProgress', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUser: any;
  let testNovel: any;
  let testChapter1: any;
  let testChapter2: any;

  beforeEach(async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values({
        username: 'reader1',
        email: 'reader1@test.com',
        password_hash: 'hashed_password',
        role: 'reader'
      })
      .returning()
      .execute();
    testUser = users[0];

    // Create test author
    const authors = await db.insert(usersTable)
      .values({
        username: 'author1',
        email: 'author1@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();
    const testAuthor = authors[0];

    // Create test novel
    const novels = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel for reading progress',
        author_id: testAuthor.id,
        genre: 'Fantasy',
        status: 'ongoing'
      })
      .returning()
      .execute();
    testNovel = novels[0];

    // Create test chapters
    const chapters1 = await db.insert(chaptersTable)
      .values({
        novel_id: testNovel.id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Content of chapter 1',
        status: 'published'
      })
      .returning()
      .execute();
    testChapter1 = chapters1[0];

    const chapters2 = await db.insert(chaptersTable)
      .values({
        novel_id: testNovel.id,
        chapter_number: 2,
        title: 'Chapter 2',
        content: 'Content of chapter 2',
        status: 'published'
      })
      .returning()
      .execute();
    testChapter2 = chapters2[0];
  });

  it('should create new reading progress when none exists', async () => {
    const result = await updateReadingProgress(testUser.id, testNovel.id, testChapter1.id);

    // Verify returned data
    expect(result.user_id).toBe(testUser.id);
    expect(result.novel_id).toBe(testNovel.id);
    expect(result.last_chapter_id).toBe(testChapter1.id);
    expect(result.is_favorite).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.last_read_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify data was saved to database
    const progressRecords = await db.select()
      .from(readingProgressTable)
      .where(and(
        eq(readingProgressTable.user_id, testUser.id),
        eq(readingProgressTable.novel_id, testNovel.id)
      ))
      .execute();

    expect(progressRecords).toHaveLength(1);
    expect(progressRecords[0].last_chapter_id).toBe(testChapter1.id);
  });

  it('should update existing reading progress', async () => {
    // First create initial progress
    await updateReadingProgress(testUser.id, testNovel.id, testChapter1.id);

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update to a different chapter
    const result = await updateReadingProgress(testUser.id, testNovel.id, testChapter2.id);

    // Verify the progress was updated
    expect(result.user_id).toBe(testUser.id);
    expect(result.novel_id).toBe(testNovel.id);
    expect(result.last_chapter_id).toBe(testChapter2.id);
    expect(result.is_favorite).toBe(false);

    // Verify only one record exists in database
    const progressRecords = await db.select()
      .from(readingProgressTable)
      .where(and(
        eq(readingProgressTable.user_id, testUser.id),
        eq(readingProgressTable.novel_id, testNovel.id)
      ))
      .execute();

    expect(progressRecords).toHaveLength(1);
    expect(progressRecords[0].last_chapter_id).toBe(testChapter2.id);
  });

  it('should update last_read_at timestamp on update', async () => {
    // Create initial progress
    const initial = await updateReadingProgress(testUser.id, testNovel.id, testChapter1.id);
    const initialTime = initial.last_read_at;

    // Wait to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update progress
    const updated = await updateReadingProgress(testUser.id, testNovel.id, testChapter2.id);

    // Verify timestamp was updated
    expect(updated.last_read_at.getTime()).toBeGreaterThan(initialTime.getTime());
  });

  it('should preserve is_favorite flag when updating', async () => {
    // Create initial progress
    await updateReadingProgress(testUser.id, testNovel.id, testChapter1.id);

    // Manually set is_favorite to true
    await db.update(readingProgressTable)
      .set({ is_favorite: true })
      .where(and(
        eq(readingProgressTable.user_id, testUser.id),
        eq(readingProgressTable.novel_id, testNovel.id)
      ))
      .execute();

    // Update progress (should preserve is_favorite)
    const result = await updateReadingProgress(testUser.id, testNovel.id, testChapter2.id);

    expect(result.is_favorite).toBe(true);
  });

  it('should handle multiple users with different novels', async () => {
    // Create another user
    const users2 = await db.insert(usersTable)
      .values({
        username: 'reader2',
        email: 'reader2@test.com',
        password_hash: 'hashed_password',
        role: 'reader'
      })
      .returning()
      .execute();
    const testUser2 = users2[0];

    // Both users read the same novel
    const progress1 = await updateReadingProgress(testUser.id, testNovel.id, testChapter1.id);
    const progress2 = await updateReadingProgress(testUser2.id, testNovel.id, testChapter2.id);

    // Verify each user has their own progress
    expect(progress1.user_id).toBe(testUser.id);
    expect(progress1.last_chapter_id).toBe(testChapter1.id);
    
    expect(progress2.user_id).toBe(testUser2.id);
    expect(progress2.last_chapter_id).toBe(testChapter2.id);

    // Verify both records exist in database
    const allProgress = await db.select()
      .from(readingProgressTable)
      .where(eq(readingProgressTable.novel_id, testNovel.id))
      .execute();

    expect(allProgress).toHaveLength(2);
  });
});
