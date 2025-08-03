
import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['visitor', 'reader', 'author', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Novel status enum
export const novelStatusSchema = z.enum(['draft', 'ongoing', 'completed', 'hiatus']);
export type NovelStatus = z.infer<typeof novelStatusSchema>;

// Chapter status enum
export const chapterStatusSchema = z.enum(['draft', 'published', 'locked']);
export type ChapterStatus = z.infer<typeof chapterStatusSchema>;

// Transaction type enum
export const transactionTypeSchema = z.enum(['purchase_coins', 'unlock_chapter', 'author_earning']);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  role: userRoleSchema,
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  coins_balance: z.number(),
  is_active: z.boolean(),
  is_email_verified: z.boolean(),
  two_factor_enabled: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type User = z.infer<typeof userSchema>;

// Novel schema
export const novelSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cover_url: z.string().nullable(),
  author_id: z.number(),
  status: novelStatusSchema,
  genre: z.string(),
  tags: z.array(z.string()),
  total_chapters: z.number().int(),
  total_views: z.number().int(),
  total_likes: z.number().int(),
  average_rating: z.number(),
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Novel = z.infer<typeof novelSchema>;

// Chapter schema
export const chapterSchema = z.object({
  id: z.number(),
  novel_id: z.number(),
  chapter_number: z.number().int(),
  title: z.string(),
  content: z.string(),
  status: chapterStatusSchema,
  coin_cost: z.number(),
  word_count: z.number().int(),
  views: z.number().int(),
  is_free: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Chapter = z.infer<typeof chapterSchema>;

// Review schema
export const reviewSchema = z.object({
  id: z.number(),
  novel_id: z.number(),
  user_id: z.number(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Review = z.infer<typeof reviewSchema>;

// Comment schema
export const commentSchema = z.object({
  id: z.number(),
  chapter_id: z.number(),
  user_id: z.number(),
  content: z.string(),
  parent_id: z.number().nullable(),
  is_moderated: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Comment = z.infer<typeof commentSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: transactionTypeSchema,
  amount: z.number(),
  description: z.string(),
  novel_id: z.number().nullable(),
  chapter_id: z.number().nullable(),
  created_at: z.coerce.date()
});
export type Transaction = z.infer<typeof transactionSchema>;

// Reading progress schema
export const readingProgressSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  novel_id: z.number(),
  last_chapter_id: z.number(),
  last_read_at: z.coerce.date(),
  is_favorite: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type ReadingProgress = z.infer<typeof readingProgressSchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleSchema.default('reader')
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createNovelInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  cover_url: z.string().url().optional(),
  genre: z.string(),
  tags: z.array(z.string()).default([])
});
export type CreateNovelInput = z.infer<typeof createNovelInputSchema>;

export const createChapterInputSchema = z.object({
  novel_id: z.number(),
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  coin_cost: z.number().nonnegative().default(0),
  is_free: z.boolean().default(true)
});
export type CreateChapterInput = z.infer<typeof createChapterInputSchema>;

export const createReviewInputSchema = z.object({
  novel_id: z.number(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().optional()
});
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const createCommentInputSchema = z.object({
  chapter_id: z.number(),
  content: z.string().min(1),
  parent_id: z.number().optional()
});
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

// Update schemas
export const updateNovelInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).optional(),
  cover_url: z.string().url().nullable().optional(),
  status: novelStatusSchema.optional(),
  genre: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional()
});
export type UpdateNovelInput = z.infer<typeof updateNovelInputSchema>;

export const updateChapterInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(10).optional(),
  status: chapterStatusSchema.optional(),
  coin_cost: z.number().nonnegative().optional(),
  is_free: z.boolean().optional()
});
export type UpdateChapterInput = z.infer<typeof updateChapterInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  role: userRoleSchema.optional(),
  is_active: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional()
});
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Query schemas
export const getNovelsQuerySchema = z.object({
  genre: z.string().optional(),
  status: novelStatusSchema.optional(),
  featured: z.boolean().optional(),
  author_id: z.number().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'updated_at', 'total_views', 'average_rating']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});
export type GetNovelsQuery = z.infer<typeof getNovelsQuerySchema>;

export const getChaptersQuerySchema = z.object({
  novel_id: z.number(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});
export type GetChaptersQuery = z.infer<typeof getChaptersQuerySchema>;

export const getUsersQuerySchema = z.object({
  role: userRoleSchema.optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

// Additional input schemas for TRPC routes
export const searchNovelsInputSchema = z.object({
  query: z.string(),
  limit: z.number().int().positive().default(20)
});
export type SearchNovelsInput = z.infer<typeof searchNovelsInputSchema>;

export const getReviewsInputSchema = z.object({
  novelId: z.number()
});
export type GetReviewsInput = z.infer<typeof getReviewsInputSchema>;

export const getCommentsInputSchema = z.object({
  chapterId: z.number()
});
export type GetCommentsInput = z.infer<typeof getCommentsInputSchema>;

export const moderateCommentInputSchema = z.object({
  commentId: z.number(),
  isApproved: z.boolean()
});
export type ModerateCommentInput = z.infer<typeof moderateCommentInputSchema>;

export const purchaseCoinsInputSchema = z.object({
  amount: z.number().positive(),
  description: z.string()
});
export type PurchaseCoinsInput = z.infer<typeof purchaseCoinsInputSchema>;

export const unlockChapterInputSchema = z.object({
  chapterId: z.number(),
  coinCost: z.number().nonnegative()
});
export type UnlockChapterInput = z.infer<typeof unlockChapterInputSchema>;

export const getTransactionsInputSchema = z.object({
  userId: z.number().optional()
});
export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;

export const updateReadingProgressInputSchema = z.object({
  novelId: z.number(),
  chapterId: z.number()
});
export type UpdateReadingProgressInput = z.infer<typeof updateReadingProgressInputSchema>;

export const toggleFavoriteInputSchema = z.object({
  novelId: z.number()
});
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteInputSchema>;

export const getAuthorStatsInputSchema = z.object({
  authorId: z.number()
});
export type GetAuthorStatsInput = z.infer<typeof getAuthorStatsInputSchema>;

// Admin dashboard stats schema
export const dashboardStatsSchema = z.object({
  total_users: z.number().int(),
  total_novels: z.number().int(),
  total_chapters: z.number().int(),
  total_revenue: z.number(),
  active_users_today: z.number().int(),
  new_users_today: z.number().int(),
  popular_novels: z.array(novelSchema).max(10),
  recent_transactions: z.array(transactionSchema).max(10)
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
