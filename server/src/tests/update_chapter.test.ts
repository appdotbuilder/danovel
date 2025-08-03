
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable } from '../db/schema';
import { type UpdateChapterInput } from '../schema';
import { updateChapter } from '../handlers/update_chapter';
import { eq } from 'drizzle-orm';

describe('updateChapter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testNovelId: number;
  let testChapterId: number;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create test novel
    const novelResult = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: testUserId,
        genre: 'fantasy'
      })
      .returning()
      .execute();
    testNovelId = novelResult[0].id;

    // Create test chapter
    const chapterResult = await db.insert(chaptersTable)
      .values({
        novel_id: testNovelId,
        chapter_number: 1,
        title: 'Original Title',
        content: 'This is the original content for testing word count calculation.',
        status: 'draft',
        coin_cost: '5.00',
        is_free: false
      })
      .returning()
      .execute();
    testChapterId = chapterResult[0].id;
  });

  it('should update chapter title', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      title: 'Updated Chapter Title'
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Updated Chapter Title');
    expect(result!.content).toEqual('This is the original content for testing word count calculation.');
    expect(result!.status).toEqual('draft');
    expect(result!.coin_cost).toEqual(5);
    expect(typeof result!.coin_cost).toEqual('number');
  });

  it('should update chapter content and recalculate word count', async () => {
    const newContent = 'This is new content with exactly ten words for testing.';
    const input: UpdateChapterInput = {
      id: testChapterId,
      content: newContent
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.content).toEqual(newContent);
    expect(result!.word_count).toEqual(10);
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
  });

  it('should update chapter status', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      status: 'published'
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.status).toEqual('published');
  });

  it('should update coin cost', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      coin_cost: 10.5
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.coin_cost).toEqual(10.5);
    expect(typeof result!.coin_cost).toEqual('number');
  });

  it('should update is_free status', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      is_free: true
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.is_free).toEqual(true);
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      title: 'New Title',
      content: 'Short content.',
      status: 'locked',
      coin_cost: 15,
      is_free: false
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('New Title');
    expect(result!.content).toEqual('Short content.');
    expect(result!.word_count).toEqual(2);
    expect(result!.status).toEqual('locked');
    expect(result!.coin_cost).toEqual(15);
    expect(result!.is_free).toEqual(false);
    expect(typeof result!.coin_cost).toEqual('number');
  });

  it('should update database record', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      title: 'Database Test Title',
      coin_cost: 7.5
    };

    await updateChapter(input);

    // Verify the change was persisted in database
    const chapters = await db.select()
      .from(chaptersTable)
      .where(eq(chaptersTable.id, testChapterId))
      .execute();

    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toEqual('Database Test Title');
    expect(parseFloat(chapters[0].coin_cost)).toEqual(7.5);
    expect(chapters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent chapter', async () => {
    const input: UpdateChapterInput = {
      id: 99999,
      title: 'Non-existent Chapter'
    };

    const result = await updateChapter(input);

    expect(result).toBeNull();
  });

  it('should handle zero coin cost', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      coin_cost: 0
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.coin_cost).toEqual(0);
    expect(typeof result!.coin_cost).toEqual('number');
  });

  it('should calculate word count correctly for empty content', async () => {
    const input: UpdateChapterInput = {
      id: testChapterId,
      content: '   '
    };

    const result = await updateChapter(input);

    expect(result).not.toBeNull();
    expect(result!.content).toEqual('   ');
    expect(result!.word_count).toEqual(1); // Split on whitespace results in one empty string
  });
});
