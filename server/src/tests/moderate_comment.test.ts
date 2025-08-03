
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, commentsTable } from '../db/schema';
import { moderateComment } from '../handlers/moderate_comment';
import { eq } from 'drizzle-orm';

describe('moderateComment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should approve a comment', async () => {
    // Create test user
    const user = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create test novel
    const novel = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A test novel',
      author_id: user[0].id,
      genre: 'fantasy'
    }).returning().execute();

    // Create test chapter
    const chapter = await db.insert(chaptersTable).values({
      novel_id: novel[0].id,
      chapter_number: 1,
      title: 'Chapter 1',
      content: 'Test chapter content'
    }).returning().execute();

    // Create test comment (initially not moderated)
    const comment = await db.insert(commentsTable).values({
      chapter_id: chapter[0].id,
      user_id: user[0].id,
      content: 'This is a test comment',
      is_moderated: false
    }).returning().execute();

    // Moderate the comment (approve)
    const result = await moderateComment(comment[0].id, true);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(comment[0].id);
    expect(result!.is_moderated).toBe(true);
    expect(result!.content).toEqual('This is a test comment');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should reject a comment', async () => {
    // Create test user
    const user = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create test novel
    const novel = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A test novel',
      author_id: user[0].id,
      genre: 'fantasy'
    }).returning().execute();

    // Create test chapter
    const chapter = await db.insert(chaptersTable).values({
      novel_id: novel[0].id,
      chapter_number: 1,
      title: 'Chapter 1',
      content: 'Test chapter content'
    }).returning().execute();

    // Create test comment (initially not moderated)
    const comment = await db.insert(commentsTable).values({
      chapter_id: chapter[0].id,
      user_id: user[0].id,
      content: 'This is an inappropriate comment',
      is_moderated: false
    }).returning().execute();

    // Moderate the comment (reject)
    const result = await moderateComment(comment[0].id, false);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(comment[0].id);
    expect(result!.is_moderated).toBe(false);
    expect(result!.content).toEqual('This is an inappropriate comment');
  });

  it('should update comment in database', async () => {
    // Create test user
    const user = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create test novel
    const novel = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A test novel',
      author_id: user[0].id,
      genre: 'fantasy'
    }).returning().execute();

    // Create test chapter
    const chapter = await db.insert(chaptersTable).values({
      novel_id: novel[0].id,
      chapter_number: 1,
      title: 'Chapter 1',
      content: 'Test chapter content'
    }).returning().execute();

    // Create test comment
    const comment = await db.insert(commentsTable).values({
      chapter_id: chapter[0].id,
      user_id: user[0].id,
      content: 'Test comment',
      is_moderated: false
    }).returning().execute();

    // Moderate the comment
    await moderateComment(comment[0].id, true);

    // Verify the comment was updated in the database
    const updatedComment = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, comment[0].id))
      .execute();

    expect(updatedComment).toHaveLength(1);
    expect(updatedComment[0].is_moderated).toBe(true);
    expect(updatedComment[0].updated_at).toBeInstanceOf(Date);
    expect(updatedComment[0].updated_at > comment[0].updated_at).toBe(true);
  });

  it('should return null for non-existent comment', async () => {
    const result = await moderateComment(99999, true);
    expect(result).toBeNull();
  });

  it('should handle moderation status changes correctly', async () => {
    // Create test user
    const user = await db.insert(usersTable).values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    }).returning().execute();

    // Create test novel
    const novel = await db.insert(novelsTable).values({
      title: 'Test Novel',
      description: 'A test novel',
      author_id: user[0].id,
      genre: 'fantasy'
    }).returning().execute();

    // Create test chapter
    const chapter = await db.insert(chaptersTable).values({
      novel_id: novel[0].id,
      chapter_number: 1,
      title: 'Chapter 1',
      content: 'Test chapter content'
    }).returning().execute();

    // Create test comment
    const comment = await db.insert(commentsTable).values({
      chapter_id: chapter[0].id,
      user_id: user[0].id,
      content: 'Test comment',
      is_moderated: false
    }).returning().execute();

    // First approve the comment
    const approvedResult = await moderateComment(comment[0].id, true);
    expect(approvedResult!.is_moderated).toBe(true);

    // Then reject the same comment
    const rejectedResult = await moderateComment(comment[0].id, false);
    expect(rejectedResult!.is_moderated).toBe(false);
  });
});
