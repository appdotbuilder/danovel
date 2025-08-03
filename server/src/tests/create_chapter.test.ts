
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chaptersTable, novelsTable, usersTable } from '../db/schema';
import { type CreateChapterInput } from '../schema';
import { createChapter } from '../handlers/create_chapter';
import { eq } from 'drizzle-orm';

describe('createChapter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testNovelId: number;

  // Helper to create prerequisite data
  const createTestUser = async () => {
    const result = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashed_password',
        role: 'author'
      })
      .returning()
      .execute();
    return result[0].id;
  };

  const createTestNovel = async (authorId: number) => {
    const result = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel for chapter testing',
        author_id: authorId,
        genre: 'Fantasy',
        tags: ['test']
      })
      .returning()
      .execute();
    return result[0].id;
  };

  beforeEach(async () => {
    testUserId = await createTestUser();
    testNovelId = await createTestNovel(testUserId);
  });

  const testInput: CreateChapterInput = {
    novel_id: 0, // Will be set in tests
    title: 'Test Chapter',
    content: 'This is a test chapter with some content to count words properly.',
    coin_cost: 5.0,
    is_free: false
  };

  it('should create a chapter', async () => {
    const input = { ...testInput, novel_id: testNovelId };
    const result = await createChapter(input);

    // Basic field validation
    expect(result.novel_id).toEqual(testNovelId);
    expect(result.chapter_number).toEqual(1);
    expect(result.title).toEqual('Test Chapter');
    expect(result.content).toEqual(input.content);
    expect(result.status).toEqual('draft');
    expect(result.coin_cost).toEqual(5.0);
    expect(typeof result.coin_cost).toEqual('number');
    expect(result.word_count).toEqual(12); // Word count of test content
    expect(result.views).toEqual(0);
    expect(result.is_free).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save chapter to database', async () => {
    const input = { ...testInput, novel_id: testNovelId };
    const result = await createChapter(input);

    const chapters = await db.select()
      .from(chaptersTable)
      .where(eq(chaptersTable.id, result.id))
      .execute();

    expect(chapters).toHaveLength(1);
    expect(chapters[0].novel_id).toEqual(testNovelId);
    expect(chapters[0].chapter_number).toEqual(1);
    expect(chapters[0].title).toEqual('Test Chapter');
    expect(chapters[0].content).toEqual(input.content);
    expect(parseFloat(chapters[0].coin_cost)).toEqual(5.0);
    expect(chapters[0].word_count).toEqual(12);
    expect(chapters[0].is_free).toEqual(false);
    expect(chapters[0].created_at).toBeInstanceOf(Date);
  });

  it('should auto-increment chapter numbers', async () => {
    const input = { ...testInput, novel_id: testNovelId };

    // Create first chapter
    const chapter1 = await createChapter(input);
    expect(chapter1.chapter_number).toEqual(1);

    // Create second chapter
    const chapter2 = await createChapter({
      ...input,
      title: 'Second Chapter'
    });
    expect(chapter2.chapter_number).toEqual(2);

    // Create third chapter
    const chapter3 = await createChapter({
      ...input,
      title: 'Third Chapter'
    });
    expect(chapter3.chapter_number).toEqual(3);
  });

  it('should calculate word count correctly', async () => {
    const testCases = [
      { content: 'One word', expectedCount: 2 },
      { content: 'This has multiple spaces between words', expectedCount: 6 }, // Fixed expected count 
      { content: '   Leading and trailing spaces   ', expectedCount: 4 },
      { content: 'Single', expectedCount: 1 },
      { content: '', expectedCount: 0 }
    ];

    for (const testCase of testCases) {
      const input = { 
        ...testInput, 
        novel_id: testNovelId,
        content: testCase.content,
        title: `Test ${testCase.expectedCount}`
      };
      const result = await createChapter(input);
      expect(result.word_count).toEqual(testCase.expectedCount);
    }
  });

  it('should handle free chapters', async () => {
    const input = { 
      ...testInput, 
      novel_id: testNovelId,
      coin_cost: 0,
      is_free: true
    };
    const result = await createChapter(input);

    expect(result.coin_cost).toEqual(0);
    expect(result.is_free).toEqual(true);
  });

  it('should reject creation for non-existent novel', async () => {
    const input = { ...testInput, novel_id: 99999 };

    expect(createChapter(input)).rejects.toThrow(/Novel with id 99999 not found/i);
  });

  it('should handle numeric coin cost conversion', async () => {
    const input = { 
      ...testInput, 
      novel_id: testNovelId,
      coin_cost: 15.75
    };
    const result = await createChapter(input);

    expect(typeof result.coin_cost).toEqual('number');
    expect(result.coin_cost).toEqual(15.75);
  });
});
