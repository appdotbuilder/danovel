
import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean,
  pgEnum,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['visitor', 'reader', 'author', 'admin']);
export const novelStatusEnum = pgEnum('novel_status', ['draft', 'ongoing', 'completed', 'hiatus']);
export const chapterStatusEnum = pgEnum('chapter_status', ['draft', 'published', 'locked']);
export const transactionTypeEnum = pgEnum('transaction_type', ['purchase_coins', 'unlock_chapter', 'author_earning']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('reader'),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  coins_balance: numeric('coins_balance', { precision: 10, scale: 2 }).notNull().default('0'),
  is_active: boolean('is_active').notNull().default(true),
  is_email_verified: boolean('is_email_verified').notNull().default(false),
  two_factor_enabled: boolean('two_factor_enabled').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Novels table
export const novelsTable = pgTable('novels', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  cover_url: text('cover_url'),
  author_id: integer('author_id').notNull().references(() => usersTable.id),
  status: novelStatusEnum('status').notNull().default('draft'),
  genre: text('genre').notNull(),
  tags: jsonb('tags').notNull().default('[]'),
  total_chapters: integer('total_chapters').notNull().default(0),
  total_views: integer('total_views').notNull().default(0),
  total_likes: integer('total_likes').notNull().default(0),
  average_rating: numeric('average_rating', { precision: 3, scale: 2 }).notNull().default('0'),
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Chapters table
export const chaptersTable = pgTable('chapters', {
  id: serial('id').primaryKey(),
  novel_id: integer('novel_id').notNull().references(() => novelsTable.id),
  chapter_number: integer('chapter_number').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: chapterStatusEnum('status').notNull().default('draft'),
  coin_cost: numeric('coin_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  word_count: integer('word_count').notNull().default(0),
  views: integer('views').notNull().default(0),
  is_free: boolean('is_free').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Reviews table
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  novel_id: integer('novel_id').notNull().references(() => novelsTable.id),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  rating: integer('rating').notNull(),
  review_text: text('review_text'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Comments table - Fix self-reference issue
export const commentsTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  chapter_id: integer('chapter_id').notNull().references(() => chaptersTable.id),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  content: text('content').notNull(),
  parent_id: integer('parent_id'), // Remove self-reference here
  is_moderated: boolean('is_moderated').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Transactions table
export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  novel_id: integer('novel_id').references(() => novelsTable.id),
  chapter_id: integer('chapter_id').references(() => chaptersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Reading progress table
export const readingProgressTable = pgTable('reading_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  novel_id: integer('novel_id').notNull().references(() => novelsTable.id),
  last_chapter_id: integer('last_chapter_id').notNull().references(() => chaptersTable.id),
  last_read_at: timestamp('last_read_at').defaultNow().notNull(),
  is_favorite: boolean('is_favorite').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  novels: many(novelsTable),
  reviews: many(reviewsTable),
  comments: many(commentsTable),
  transactions: many(transactionsTable),
  readingProgress: many(readingProgressTable)
}));

export const novelsRelations = relations(novelsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [novelsTable.author_id],
    references: [usersTable.id]
  }),
  chapters: many(chaptersTable),
  reviews: many(reviewsTable),
  transactions: many(transactionsTable),
  readingProgress: many(readingProgressTable)
}));

export const chaptersRelations = relations(chaptersTable, ({ one, many }) => ({
  novel: one(novelsTable, {
    fields: [chaptersTable.novel_id],
    references: [novelsTable.id]
  }),
  comments: many(commentsTable),
  transactions: many(transactionsTable),
  readingProgress: many(readingProgressTable)
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  novel: one(novelsTable, {
    fields: [reviewsTable.novel_id],
    references: [novelsTable.id]
  }),
  user: one(usersTable, {
    fields: [reviewsTable.user_id],
    references: [usersTable.id]
  })
}));

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  chapter: one(chaptersTable, {
    fields: [commentsTable.chapter_id],
    references: [chaptersTable.id]
  }),
  user: one(usersTable, {
    fields: [commentsTable.user_id],
    references: [usersTable.id]
  }),
  parent: one(commentsTable, {
    fields: [commentsTable.parent_id],
    references: [commentsTable.id],
    relationName: 'parentComment'
  }),
  replies: many(commentsTable, {
    relationName: 'parentComment'
  })
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [transactionsTable.user_id],
    references: [usersTable.id]
  }),
  novel: one(novelsTable, {
    fields: [transactionsTable.novel_id],
    references: [novelsTable.id]
  }),
  chapter: one(chaptersTable, {
    fields: [transactionsTable.chapter_id],
    references: [chaptersTable.id]
  })
}));

export const readingProgressRelations = relations(readingProgressTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [readingProgressTable.user_id],
    references: [usersTable.id]
  }),
  novel: one(novelsTable, {
    fields: [readingProgressTable.novel_id],
    references: [novelsTable.id]
  }),
  lastChapter: one(chaptersTable, {
    fields: [readingProgressTable.last_chapter_id],
    references: [chaptersTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  novels: novelsTable,
  chapters: chaptersTable,
  reviews: reviewsTable,
  comments: commentsTable,
  transactions: transactionsTable,
  readingProgress: readingProgressTable
};
