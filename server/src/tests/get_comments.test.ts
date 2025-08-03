
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable, chaptersTable, commentsTable } from '../db/schema';
import { getComments } from '../handlers/get_comments';

describe('getComments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no comments exist', async () => {
    const result = await getComments(999);
    expect(result).toEqual([]);
  });

  it('should return comments for a chapter', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();

    const [novel] = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: user.id,
        genre: 'Fantasy'
      })
      .returning()
      .execute();

    const [chapter] = await db.insert(chaptersTable)
      .values({
        novel_id: novel.id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Chapter content'
      })
      .returning()
      .execute();

    // Create test comments with slight delay to ensure ordering
    const [comment1] = await db.insert(commentsTable)
      .values({
        chapter_id: chapter.id,
        user_id: user.id,
        content: 'Great chapter!',
        is_moderated: true
      })
      .returning()
      .execute();

    // Add small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1));

    const [comment2] = await db.insert(commentsTable)
      .values({
        chapter_id: chapter.id,
        user_id: user.id,
        content: 'I loved this part.',
        parent_id: comment1.id,
        is_moderated: false
      })
      .returning()
      .execute();

    const result = await getComments(chapter.id);

    expect(result).toHaveLength(2);
    
    // Find comments by content to avoid order dependency
    const firstComment = result.find(c => c.content === 'Great chapter!');
    const secondComment = result.find(c => c.content === 'I loved this part.');

    expect(firstComment).toBeDefined();
    expect(firstComment!.id).toBe(comment1.id);
    expect(firstComment!.chapter_id).toBe(chapter.id);
    expect(firstComment!.user_id).toBe(user.id);
    expect(firstComment!.parent_id).toBeNull();
    expect(firstComment!.is_moderated).toBe(true);
    expect(firstComment!.created_at).toBeInstanceOf(Date);
    expect(firstComment!.updated_at).toBeInstanceOf(Date);

    expect(secondComment).toBeDefined();
    expect(secondComment!.id).toBe(comment2.id);
    expect(secondComment!.chapter_id).toBe(chapter.id);
    expect(secondComment!.user_id).toBe(user.id);
    expect(secondComment!.parent_id).toBe(comment1.id);
    expect(secondComment!.is_moderated).toBe(false);
    expect(secondComment!.created_at).toBeInstanceOf(Date);
    expect(secondComment!.updated_at).toBeInstanceOf(Date);
  });

  it('should only return comments for specified chapter', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      })
      .returning()
      .execute();

    const [novel] = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: user.id,
        genre: 'Fantasy'
      })
      .returning()
      .execute();

    const [chapter1] = await db.insert(chaptersTable)
      .values({
        novel_id: novel.id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Chapter 1 content'
      })
      .returning()
      .execute();

    const [chapter2] = await db.insert(chaptersTable)
      .values({
        novel_id: novel.id,
        chapter_number: 2,
        title: 'Chapter 2',
        content: 'Chapter 2 content'
      })
      .returning()
      .execute();

    // Create comments for both chapters
    await db.insert(commentsTable)
      .values([
        {
          chapter_id: chapter1.id,
          user_id: user.id,
          content: 'Comment on chapter 1'
        },
        {
          chapter_id: chapter2.id,
          user_id: user.id,
          content: 'Comment on chapter 2'
        }
      ])
      .execute();

    const result = await getComments(chapter1.id);

    expect(result).toHaveLength(1);
    expect(result[0].chapter_id).toBe(chapter1.id);
    expect(result[0].content).toBe('Comment on chapter 1');
  });

  it('should handle multiple users commenting on same chapter', async () => {
    // Create prerequisite data
    const users = await db.insert(usersTable)
      .values([
        {
          username: 'user1',
          email: 'user1@example.com',
          password_hash: 'hashedpassword1'
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password_hash: 'hashedpassword2'
        }
      ])
      .returning()
      .execute();

    const [novel] = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel',
        author_id: users[0].id,
        genre: 'Fantasy'
      })
      .returning()
      .execute();

    const [chapter] = await db.insert(chaptersTable)
      .values({
        novel_id: novel.id,
        chapter_number: 1,
        title: 'Chapter 1',
        content: 'Chapter content'
      })
      .returning()
      .execute();

    // Create comments from different users
    await db.insert(commentsTable)
      .values([
        {
          chapter_id: chapter.id,
          user_id: users[0].id,
          content: 'Comment from user 1'
        },
        {
          chapter_id: chapter.id,
          user_id: users[1].id,
          content: 'Comment from user 2'
        }
      ])
      .execute();

    const result = await getComments(chapter.id);

    expect(result).toHaveLength(2);
    expect(result.some(c => c.user_id === users[0].id && c.content === 'Comment from user 1')).toBe(true);
    expect(result.some(c => c.user_id === users[1].id && c.content === 'Comment from user 2')).toBe(true);
  });
});
