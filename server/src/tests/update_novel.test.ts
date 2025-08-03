
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, novelsTable } from '../db/schema';
import { type UpdateNovelInput, type CreateUserInput } from '../schema';
import { updateNovel } from '../handlers/update_novel';
import { eq } from 'drizzle-orm';

describe('updateNovel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let authorId: number;
  let novelId: number;

  beforeEach(async () => {
    // Create test author
    const author = await db.insert(usersTable)
      .values({
        username: 'testauthor',
        email: 'author@test.com',
        password_hash: 'hashedpassword',
        role: 'author'
      })
      .returning()
      .execute();

    authorId = author[0].id;

    // Create test novel
    const novel = await db.insert(novelsTable)
      .values({
        title: 'Test Novel',
        description: 'A test novel description',
        author_id: authorId,
        genre: 'Fantasy',
        tags: JSON.stringify(['magic', 'adventure']),
        status: 'draft'
      })
      .returning()
      .execute();

    novelId = novel[0].id;
  });

  it('should update novel title', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      title: 'Updated Novel Title'
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Updated Novel Title');
    expect(result!.description).toEqual('A test novel description');
    expect(result!.genre).toEqual('Fantasy');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update novel description', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      description: 'Updated description with more details'
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.description).toEqual('Updated description with more details');
    expect(result!.title).toEqual('Test Novel');
  });

  it('should update novel status', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      status: 'ongoing'
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.status).toEqual('ongoing');
  });

  it('should update novel cover_url including null value', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      cover_url: 'https://example.com/cover.jpg'
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.cover_url).toEqual('https://example.com/cover.jpg');

    // Test setting to null
    const nullUpdateInput: UpdateNovelInput = {
      id: novelId,
      cover_url: null
    };

    const nullResult = await updateNovel(nullUpdateInput);

    expect(nullResult).not.toBeNull();
    expect(nullResult!.cover_url).toBeNull();
  });

  it('should update novel tags', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      tags: ['action', 'romance', 'drama']
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.tags).toEqual(['action', 'romance', 'drama']);
    expect(Array.isArray(result!.tags)).toBe(true);
  });

  it('should update featured status', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      is_featured: true
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.is_featured).toBe(true);
  });

  it('should update multiple fields at once', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      title: 'Multi-Update Novel',
      description: 'Updated with multiple fields',
      status: 'completed',
      genre: 'Science Fiction',
      tags: ['sci-fi', 'space'],
      is_featured: true
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Multi-Update Novel');
    expect(result!.description).toEqual('Updated with multiple fields');
    expect(result!.status).toEqual('completed');
    expect(result!.genre).toEqual('Science Fiction');
    expect(result!.tags).toEqual(['sci-fi', 'space']);
    expect(result!.is_featured).toBe(true);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent novel', async () => {
    const updateInput: UpdateNovelInput = {
      id: 99999,
      title: 'Non-existent Novel'
    };

    const result = await updateNovel(updateInput);

    expect(result).toBeNull();
  });

  it('should save changes to database', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      title: 'Database Update Test',
      status: 'ongoing',
      is_featured: true
    };

    await updateNovel(updateInput);

    // Verify changes were saved to database
    const novels = await db.select()
      .from(novelsTable)
      .where(eq(novelsTable.id, novelId))
      .execute();

    expect(novels).toHaveLength(1);
    expect(novels[0].title).toEqual('Database Update Test');
    expect(novels[0].status).toEqual('ongoing');
    expect(novels[0].is_featured).toBe(true);
    expect(novels[0].updated_at).toBeInstanceOf(Date);
  });

  it('should preserve numeric fields correctly', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      title: 'Numeric Test'
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(typeof result!.average_rating).toBe('number');
    expect(result!.average_rating).toEqual(0);
    expect(typeof result!.total_chapters).toBe('number');
    expect(typeof result!.total_views).toBe('number');
    expect(typeof result!.total_likes).toBe('number');
  });

  it('should only update specified fields', async () => {
    const updateInput: UpdateNovelInput = {
      id: novelId,
      title: 'Partial Update'
    };

    const result = await updateNovel(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Partial Update');
    expect(result!.description).toEqual('A test novel description'); // Unchanged
    expect(result!.genre).toEqual('Fantasy'); // Unchanged
    expect(result!.status).toEqual('draft'); // Unchanged
  });
});
