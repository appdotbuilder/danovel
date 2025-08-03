
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, commentsTable } from '../db/schema';
import { type CreateCommentInput } from '../schema';
import { createComment } from '../handlers/create_comment';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hashedpassword',
  role: 'reader' as const
};

const testAuthor = {
  username: 'testauthor',
  email: 'author@example.com',
  password_hash: 'hashedpassword',
  role: 'author' as const
};

const testNovel = {
  title: 'Test Novel',
  description: 'A test novel',
  genre: 'Fantasy',
  tags: ['test']
};

const testChapter = {
  chapter_number: 1,
  title: 'Chapter 1',
  content: 'This is test chapter content',
  word_count: 6
};

describe('createComment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a comment on a chapter', async () => {
    // Create user and author
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const [author] = await db.insert(usersTable)
      .values(testAuthor)
      .returning()
      .execute();

    // Create novel
    const [novel] = await db.insert(novelsTable)
      .values({
        ...testNovel,
        author_id: author.id
      })
      .returning()
      .execute();

    // Create chapter
    const [chapter] = await db.insert(chaptersTable)
      .values({
        ...testChapter,
        novel_id: novel.id
      })
      .returning()
      .execute();

    const input: CreateCommentInput = {
      chapter_id: chapter.id,
      content: 'This is a test comment'
    };

    const result = await createComment(input, user.id);

    expect(result.id).toBeDefined();
    expect(result.chapter_id).toEqual(chapter.id);
    expect(result.user_id).toEqual(user.id);
    expect(result.content).toEqual('This is a test comment');
    expect(result.parent_id).toBeNull();
    expect(result.is_moderated).toBe(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save comment to database', async () => {
    // Create user and author
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const [author] = await db.insert(usersTable)
      .values(testAuthor)
      .returning()
      .execute();

    // Create novel
    const [novel] = await db.insert(novelsTable)
      .values({
        ...testNovel,
        author_id: author.id
      })
      .returning()
      .execute();

    // Create chapter
    const [chapter] = await db.insert(chaptersTable)
      .values({
        ...testChapter,
        novel_id: novel.id
      })
      .returning()
      .execute();

    const input: CreateCommentInput = {
      chapter_id: chapter.id,
      content: 'This is a test comment'
    };

    const result = await createComment(input, user.id);

    // Verify comment was saved to database
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, result.id))
      .execute();

    expect(comments).toHaveLength(1);
    expect(comments[0].chapter_id).toEqual(chapter.id);
    expect(comments[0].user_id).toEqual(user.id);
    expect(comments[0].content).toEqual('This is a test comment');
    expect(comments[0].parent_id).toBeNull();
    expect(comments[0].is_moderated).toBe(false);
  });

  it('should create a reply comment with parent_id', async () => {
    // Create user and author
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const [author] = await db.insert(usersTable)
      .values(testAuthor)
      .returning()
      .execute();

    // Create novel
    const [novel] = await db.insert(novelsTable)
      .values({
        ...testNovel,
        author_id: author.id
      })
      .returning()
      .execute();

    // Create chapter
    const [chapter] = await db.insert(chaptersTable)
      .values({
        ...testChapter,
        novel_id: novel.id
      })
      .returning()
      .execute();

    // Create parent comment
    const [parentComment] = await db.insert(commentsTable)
      .values({
        chapter_id: chapter.id,
        user_id: user.id,
        content: 'Parent comment'
      })
      .returning()
      .execute();

    const input: CreateCommentInput = {
      chapter_id: chapter.id,
      content: 'This is a reply comment',
      parent_id: parentComment.id
    };

    const result = await createComment(input, user.id);

    expect(result.parent_id).toEqual(parentComment.id);
    expect(result.chapter_id).toEqual(chapter.id);
    expect(result.content).toEqual('This is a reply comment');
  });

  it('should throw error when chapter does not exist', async () => {
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const input: CreateCommentInput = {
      chapter_id: 999, // Non-existent chapter
      content: 'This comment should fail'
    };

    expect(createComment(input, user.id)).rejects.toThrow(/chapter not found/i);
  });

  it('should throw error when parent comment does not exist', async () => {
    // Create user and author
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const [author] = await db.insert(usersTable)
      .values(testAuthor)
      .returning()
      .execute();

    // Create novel
    const [novel] = await db.insert(novelsTable)
      .values({
        ...testNovel,
        author_id: author.id
      })
      .returning()
      .execute();

    // Create chapter
    const [chapter] = await db.insert(chaptersTable)
      .values({
        ...testChapter,
        novel_id: novel.id
      })
      .returning()
      .execute();

    const input: CreateCommentInput = {
      chapter_id: chapter.id,
      content: 'This is a reply comment',
      parent_id: 999 // Non-existent parent
    };

    expect(createComment(input, user.id)).rejects.toThrow(/parent comment not found/i);
  });

  it('should throw error when parent comment is for different chapter', async () => {
    // Create user and author
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const [author] = await db.insert(usersTable)
      .values(testAuthor)
      .returning()
      .execute();

    // Create novel
    const [novel] = await db.insert(novelsTable)
      .values({
        ...testNovel,
        author_id: author.id
      })
      .returning()
      .execute();

    // Create two chapters
    const [chapter1] = await db.insert(chaptersTable)
      .values({
        ...testChapter,
        novel_id: novel.id
      })
      .returning()
      .execute();

    const [chapter2] = await db.insert(chaptersTable)
      .values({
        ...testChapter,
        chapter_number: 2,
        title: 'Chapter 2',
        novel_id: novel.id
      })
      .returning()
      .execute();

    // Create parent comment on chapter1
    const [parentComment] = await db.insert(commentsTable)
      .values({
        chapter_id: chapter1.id,
        user_id: user.id,
        content: 'Parent comment on chapter 1'
      })
      .returning()
      .execute();

    // Try to create reply on chapter2 with parent from chapter1
    const input: CreateCommentInput = {
      chapter_id: chapter2.id,
      content: 'This reply should fail',
      parent_id: parentComment.id
    };

    expect(createComment(input, user.id)).rejects.toThrow(/parent comment must be for the same chapter/i);
  });
});
